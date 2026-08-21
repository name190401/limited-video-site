// 事業説明ファネル動画（§03/§04/§05/§08）の検証＋スクショ。MCPの5s制限回避＝headless Chrome 直駆動。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/shoot-funnel.cjs [width]
const { chromium } = require('playwright')
const { loginAsMember } = require('./_login.cjs')
const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = 'http://localhost:3100'

const EXPECT = {
  ear_opening: ['ySzQg8d3iQ4', 'GYp6q1XNDr4', '19RgaxonW5Q', 'etWgf_7JA6I', '9P9myBeBy2Q', 'j0UfpCtr-n0', 'VTDkDjt4rIk'],
  plan_intro: ['KUYqhhJ_VMY', '1Pf9pBZKcHs', 'AcxykSFFl4o', 'Q2aHPK7DaBE'],
  closing: { '中村佳世': 'GPAEvwQ8-Gs', '阿部美道': '3PCylFu0lGg', '久保田幸世': 'cSOg2bSuh54', '竹之内尚也': 'sX0TJ9Ubxl0' },
  bonus: ['c8DiLN6lVsY', '1k9wXYFFOVU'],
}

const idsOnPage = (page) =>
  page.evaluate(() => {
    const re = /\/vi\/([\w-]{11})\//
    return [...document.querySelectorAll('img')]
      .map((i) => (i.src.match(/\/vi\/([\w-]{11})\//) || [])[1])
      .filter(Boolean)
  })

const scrollToHeading = (page, text) =>
  page.evaluate((t) => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes(t))
    if (!h) return false
    const sec = h.closest('section') || h.parentElement
    const top = window.scrollY + sec.getBoundingClientRect().top - 8
    window.scrollTo({ top, behavior: 'instant' })
    return true
  }, text)

;(async () => {
  const width = parseInt(process.argv[2] || '375', 10)
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))

  // Layer1 ログイン
  await loginAsMember(page, BASE)
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1500)

  const report = { sections: {}, consoleErrors: [], screenshots: [] }

  // 全ポスターID（初期表示・closing は先頭タブのみ）
  const all = await idsOnPage(page)
  const has = (id) => all.includes(id)

  report.sections.ear_opening = EXPECT.ear_opening.map((id) => ({ id, found: has(id) }))
  report.sections.plan_intro = EXPECT.plan_intro.map((id) => ({ id, found: has(id) }))
  report.sections.bonus = EXPECT.bonus.map((id) => ({ id, found: has(id) }))

  // §05 クロージング: タブを順にクリックして各動画IDを確認
  report.sections.closing = []
  for (const [name, id] of Object.entries(EXPECT.closing)) {
    let found = false
    try {
      // クロージング章内のタブ（textContent===名前の button）をクリック
      const clicked = await page.evaluate((nm) => {
        const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('エンディング'))
        const sec = h ? (h.closest('section') || h.parentElement) : document
        const btn = [...sec.querySelectorAll('button')].find((b) => b.textContent.trim() === nm || b.textContent.trim().startsWith(nm))
        if (btn) { btn.click(); return true }
        return false
      }, name)
      if (clicked) await page.waitForTimeout(500)
      const ids = await idsOnPage(page)
      found = ids.includes(id)
    } catch (e) { /* noop */ }
    report.sections.closing.push({ name, id, clicked: true, found })
  }

  // スクショ（各セクション先頭へスクロール）
  const shots = [
    ['オープニング', 'funnel-03-ear'],
    ['プラン説明', 'funnel-04-plan'],
    ['エンディング', 'funnel-05-closing'],
    ['ボーナス（インカム）', 'funnel-07-bonus'],
  ]
  for (const [heading, tag] of shots) {
    const ok = await scrollToHeading(page, heading)
    await page.waitForTimeout(900)
    const path = `${OUT}/qualia-${tag}.jpeg`
    await page.screenshot({ path, type: 'jpeg', quality: 82 })
    report.screenshots.push({ heading, found: ok, path })
  }

  report.consoleErrors = consoleErrors

  await browser.close()
  console.log(JSON.stringify(report, null, 2))
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

// 全画面ライトボックス＋YouTube非遷移カスタムプレーヤーの検証。headless Chrome 直駆動。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-player.cjs
const { chromium } = require('playwright')
const OUT = '/Users/hajime/Desktop/限定公開'
const BASE = 'http://localhost:3100'

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))

  // Layer1
  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'qualia2026' }) })
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1200)

  const report = { steps: {} }

  // §03 先頭の動画ポスターをクリック
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('耳開け・導入'))
    const sec = h.closest('section') || h.parentElement
    const top = window.scrollY + sec.getBoundingClientRect().top - 8
    window.scrollTo({ top, behavior: 'instant' })
  })
  await page.waitForTimeout(600)
  const clicked = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('耳開け・導入'))
    const sec = h.closest('section') || h.parentElement
    const btn = [...sec.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('全画面で再生'))
    if (btn) { btn.click(); return btn.getAttribute('aria-label') }
    return null
  })
  report.steps.clickedPoster = clicked

  // ライトボックス（dialog）が開くか
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 }).catch(() => {})
  report.steps.dialogOpen = await page.$('[role="dialog"]') ? true : false

  // SitePlayer の iframe（YT API が生成）を待つ
  await page.waitForSelector('[role="dialog"] iframe', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(2500)

  const probe = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    if (!dlg) return { dialog: false }
    const ifr = dlg.querySelector('iframe')
    const cs = ifr ? getComputedStyle(ifr) : null
    const labels = [...dlg.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')).filter(Boolean)
    // dialog がほぼ全画面か
    const r = dlg.getBoundingClientRect()
    const fullscreenish = r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2
    // youtube.com への素のリンク(aタグ)が無いこと
    const ytAnchors = [...dlg.querySelectorAll('a[href]')].filter((a) => /youtube\.com|youtu\.be/.test(a.href)).length
    return {
      dialog: true,
      fullscreenish,
      iframeSrc: ifr ? ifr.src : null,
      iframePointerEvents: cs ? cs.pointerEvents : null,
      controlLabels: labels,
      ytAnchorCount: ytAnchors,
    }
  })
  report.steps.player = probe

  // 全画面スクショ
  await page.screenshot({ path: `${OUT}/qualia-player-fullscreen.jpeg`, type: 'jpeg', quality: 85 })

  // ミュートボタンを押して状態が変わるか（自前コントロール動作）
  const muteToggled = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    const before = [...dlg.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))
    const mb = [...dlg.querySelectorAll('button')].find((b) => /ミュート/.test(b.getAttribute('aria-label') || ''))
    if (!mb) return null
    mb.click()
    return before
  })
  await page.waitForTimeout(400)
  report.steps.muteControlExists = muteToggled ? true : false

  // ESC で閉じる
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  report.steps.closedByEsc = (await page.$('[role="dialog"]')) ? false : true

  report.consoleErrors = consoleErrors.filter((e) => !/youtube|gstatic|doubleclick|ERR_BLOCKED|net::|postMessage|Permissions policy|gen_204/i.test(e))
  report.consoleErrorsRaw = consoleErrors

  await browser.close()
  console.log(JSON.stringify(report, null, 2))
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

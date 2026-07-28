// Layer2 3セクション共有ゲート＋公開コンテンツ＋抑止パッケージ＋ログアウトの総合検証。headless Chrome 直駆動。
// 使い方: QCODE=<当日コード> NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-layer2.cjs [width]
// 当日コードを渡さない場合は .env.local の PASSWORD_SECRET_KEY から自動算出する。
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = process.env.BASE || 'http://localhost:3100'

const PLAN_IDS = ['KUYqhhJ_VMY', '1Pf9pBZKcHs', 'AcxykSFFl4o', 'Q2aHPK7DaBE']
const PRODUCT_IDS = ['tuSEuVC6SQU', 'PKTwEWA5n3A', 'XOo-ifRXVBw']
const TRAINING_IDS = ['MSmZCalPv8k', 'Ps3ZD2amsAw', 'VGE1ldPVLK8', 'ZC0cfGnM3RU', 'n-XHJeTc2Lc', 'H3ZscAXE4w8', 'hWvsTr2v1Co', 'xj6dIKdqo1c', 'B_Cd-YQ1h30']
const PROTECTED_IDS = [...PLAN_IDS, ...PRODUCT_IDS, ...TRAINING_IDS]
const BONUS_IDS = ['c8DiLN6lVsY', '1k9wXYFFOVU']

function todayCode() {
  if (process.env.QCODE) return process.env.QCODE
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  const key = env.match(/^PASSWORD_SECRET_KEY=(.*)$/m)[1].trim()
  const jst = new Date(Date.now() + 9 * 3600 * 1000)
  const d = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, '0')}-${String(jst.getUTCDate()).padStart(2, '0')}`
  const hash = crypto.createHash('sha256').update(key + d + '0').digest('hex')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let p = ''
  for (let i = 0; i < 6; i++) p += chars[parseInt(hash.substr(i * 2, 2), 16) % chars.length]
  return p
}

const idsOnPage = (page) =>
  page.evaluate(() => [...document.querySelectorAll('img')]
    .map((i) => (i.src.match(/\/vi\/([\w-]{11})\//) || [])[1])
    .filter(Boolean))

const gateCount = (page) =>
  page.evaluate(() => [...document.querySelectorAll('input[placeholder="合言葉"]')].length)

const sectionInfo = (page, heading) => page.evaluate((text) => {
  const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes(text))
  if (!h) return { found: false, ids: [], text: '' }
  const sec = h.closest('section') || h.parentElement
  const ids = [...sec.querySelectorAll('img')]
    .map((i) => (i.src.match(/\/vi\/([\w-]{11})\//) || [])[1])
    .filter(Boolean)
  return { found: true, ids, text: sec.textContent }
}, heading)

const scrollToHeading = (page, text) =>
  page.evaluate((t) => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes(t))
    if (!h) return false
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
    return true
  }, text)

const shot = async (page, report, tag) => {
  const p = `${OUT}/qualia-l2-${tag}.jpeg`
  await page.screenshot({ path: p, type: 'jpeg', quality: 82 })
  report.screenshots.push(p)
}

;(async () => {
  const width = parseInt(process.argv[2] || '375', 10)
  const code = todayCode()
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))

  const report = { width, checks: [], screenshots: [] }
  const check = (name, pass, detail = '') => report.checks.push({ name, pass, detail })

  // Layer1 ログイン
  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'qualia2026' }),
    })
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1500)

  // 1) 初期ペイロードに保護IDが無い
  const html = await page.content()
  const leaked = PROTECTED_IDS.filter((id) => html.includes(id))
  check('初期ペイロードに保護16IDが無い', leaked.length === 0, leaked.join(',') || 'clean')

  // 2) 未解除でゲート3つ（§04/§08/§09）
  const gates = await gateCount(page)
  check('未解除ゲート数=3', gates === 3, `gates=${gates}`)

  const bonusLocked = await sectionInfo(page, 'ボーナス（インカム）')
  const bonusFound = BONUS_IDS.filter((id) => bonusLocked.ids.includes(id))
  check('§07ボーナスにLayer1動画2本表示', bonusFound.length === 2, `found=${bonusFound.join(',') || 'none'}`)
  await scrollToHeading(page, 'ボーナス（インカム）'); await page.waitForTimeout(500)
  await shot(page, report, '07-bonus')

  await scrollToHeading(page, 'プラン説明'); await page.waitForTimeout(700)
  await shot(page, report, '04-locked')

  // 3) §04 のゲートで解除 → リロード無しで全セクション解除
  const typed = await page.evaluate((c) => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('プラン説明'))
    const sec = h ? (h.closest('section') || h.parentElement) : null
    const input = sec && sec.querySelector('input[placeholder="合言葉"]')
    if (!input) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, c)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }, code)
  check('§04ゲートに入力', typed)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('プラン説明'))
    const sec = h ? (h.closest('section') || h.parentElement) : null
    const btn = sec && [...sec.querySelectorAll('button')].find((b) => b.textContent.includes('解除する'))
    if (btn) btn.click()
  })
  await page.waitForTimeout(2500)

  const gatesAfter = await gateCount(page)
  check('解除後ゲート数=0（3セクション同時解除）', gatesAfter === 0, `gates=${gatesAfter}`)

  const plan = await sectionInfo(page, 'プラン説明')
  const planFound = PLAN_IDS.filter((id) => plan.ids.includes(id))
  const planHeadings = plan.text.includes('ロングバージョン') && plan.text.includes('ショートバージョン')
  check('§04に4本のポスター＋ロング/ショート見出し', planFound.length === 4 && planHeadings, `found=${planFound.length}/4, headings=${planHeadings}`)

  await scrollToHeading(page, 'プラン説明'); await page.waitForTimeout(700)
  await shot(page, report, '04-unlocked')

  // 4) §08 製品: 3タブの存在＋各タブで対応する動画1本だけを描画
  const productTabs = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('製品'))
    if (!h) return { ok: false }
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
    const tabs = [...sec.querySelectorAll('button')].map((b) => b.textContent.trim())
    return { ok: true, tabs }
  })
  const expectedProductTabs = ['パーソナル', 'プロダクト全14品', 'BELLEQUAGE']
  const productViews = []
  for (let i = 0; i < expectedProductTabs.length; i++) {
    const label = expectedProductTabs[i]
    const clicked = await page.evaluate((tabLabel) => {
      const sec = document.querySelector('#sec-08')?.closest('section')
      const btn = sec && [...sec.querySelectorAll('button')].find((b) => b.textContent.trim() === tabLabel)
      if (!btn) return false
      btn.click()
      return true
    }, label)
    await page.waitForTimeout(600)
    const ids = await page.evaluate(() => {
      const sec = document.querySelector('#sec-08')?.closest('section')
      return [...(sec?.querySelectorAll('img') || [])]
        .map((img) => (img.src.match(/\/vi\/([\w-]{11})\//) || [])[1])
        .filter(Boolean)
    })
    productViews.push({ label, clicked, ids })
  }
  const productTabsExact = expectedProductTabs.every((label) => productTabs.tabs?.includes(label))
    && productTabs.tabs?.filter((label) => expectedProductTabs.includes(label)).length === 3
  const productViewsExact = productViews.every((view, i) =>
    view.clicked && view.ids.length === 1 && view.ids[0] === PRODUCT_IDS[i])
  check('§08製品の3タブと各タブ対応動画1本', productTabsExact && productViewsExact, JSON.stringify({ tabs: productTabs.tabs, views: productViews }))
  await shot(page, report, '08-products')

  // 5) §09 トレーニング: 準備中なし、公開9本
  const training = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('トレーニング'))
    if (!h) return { ok: false }
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
    const ids = [...sec.querySelectorAll('img')].map((i) => (i.src.match(/\/vi\/([\w-]{11})\//) || [])[1]).filter(Boolean)
    return { ok: true, ready: (sec.textContent.match(/準備中/g) || []).length, ids }
  })
  const trainingFound = TRAINING_IDS.filter((id) => training.ids?.includes(id))
  check('§09トレーニングは準備中0・サムネイル9本', training.ok && training.ready === 0 && trainingFound.length === 9, JSON.stringify({ ready: training.ready, found: trainingFound.length }))
  await page.waitForTimeout(600)
  await shot(page, report, '09-training')

  // 6) §10（PDFは2026-07-21のクライアント要望で一時削除→準備中カード）、§11 Layer1動画
  await scrollToHeading(page, '登録の流れ'); await page.waitForTimeout(500)
  const pdf = await page.evaluate(() => {
    const a = document.querySelector('a[href*="d27rnpuamwvieu.cloudfront.net"]')
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('登録の流れ'))
    const sec = h ? (h.closest('section') || h.parentElement) : null
    return { found: !!a, comingSoon: !!sec && sec.textContent.includes('準備中') }
  })
  check('§10登録の流れ: PDFリンク無し＋準備中カード表示', !pdf.found && pdf.comingSoon, JSON.stringify(pdf))
  await shot(page, report, '10-pdf')

  await scrollToHeading(page, 'QUALIA ページの使い方'); await page.waitForTimeout(500)
  const howTo = await sectionInfo(page, 'QUALIA ページの使い方')
  check('§11使い方にLayer1動画サムネイル', howTo.ids.includes('jeCttlIq6ss'), howTo.ids.join(',') || 'none')
  await shot(page, report, '11-how-to')

  // 5) ウォーターマーク: §04 の動画を開いてライトボックス内を確認
  await scrollToHeading(page, 'プラン説明'); await page.waitForTimeout(500)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('プラン説明'))
    const sec = h.closest('section') || h.parentElement
    const card = [...sec.querySelectorAll('button')].find((b) => b.querySelector('img'))
    if (card) card.click()
  })
  await page.waitForTimeout(2500)
  const wm = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('span')].filter((s) => /^QUALIA \d{4}\/\d{2}\/\d{2}/.test(s.textContent))
    const caption = document.body.textContent.includes('スクリーンショット・画面録画は禁止されています')
    return { marks: spans.length, caption }
  })
  check('ライトボックスにウォーターマーク+禁止キャプション', wm.marks >= 9 && wm.caption, JSON.stringify(wm))
  await shot(page, report, 'lightbox-watermark')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)

  // 6) PrintScreen 検知モーダル
  await page.keyboard.press('PrintScreen')
  await page.waitForTimeout(600)
  const psModal = await page.evaluate(() => document.body.textContent.includes('スクリーンショットは禁止されています'))
  check('PrintScreenで警告モーダル表示', psModal)
  await shot(page, report, 'printscreen-modal')
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '閉じる')
    if (btn) btn.click()
  })
  await page.waitForTimeout(400)

  // 7) 下部常時警告文
  const notice = await page.evaluate(() => document.body.textContent.includes('スクリーンショット・画面録画・無断転載は固く禁止されています'))
  check('下部の常時警告文', notice)

  // 8) フッターの完全形エンブレム（読み込み成功・四辺がビューポート内）
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(900)
  const footerLogo = await page.evaluate(() => {
    const img = document.querySelector('img[src*="castle-emblem-full-white"]')
    if (!img) return { found: false }
    const r = img.getBoundingClientRect()
    return {
      found: true, loaded: img.naturalWidth > 0,
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      inViewport: r.left >= 0 && r.right <= window.innerWidth,
    }
  })
  check('フッター完全形エンブレム表示', footerLogo.found && footerLogo.loaded && footerLogo.inViewport, JSON.stringify(footerLogo))
  await shot(page, report, 'footer')

  // 9) ハンバーガーメニューのログアウト → /enter へ、/ は再び 307
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('メニュー'))
    if (btn) btn.click()
    else document.querySelector('header button, [class*="menu"] button')?.click()
  })
  await page.waitForTimeout(700)
  const hasLogout = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('ログアウト')))
  check('メニューにログアウトボタン', hasLogout)
  await shot(page, report, 'menu-logout')
  if (hasLogout) {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('ログアウト'))
      btn.click()
    })
    await page.waitForURL('**/enter', { timeout: 15000 }).catch(() => {})
    const onEnter = page.url().includes('/enter')
    check('ログアウト後 /enter へ遷移', onEnter, page.url())
    // Cookie 破棄確認: / へ行くと /enter へ戻される
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    check('ログアウト後 / は再ゲート', page.url().includes('/enter'), page.url())
  }

  report.consoleErrors = consoleErrors
  await browser.close()

  const failed = report.checks.filter((c) => !c.pass)
  console.log(JSON.stringify(report, null, 2))
  console.log(failed.length === 0 && consoleErrors.length === 0 ? '\nALL PASS' : `\nFAILED: ${failed.length} checks, ${consoleErrors.length} console errors`)
  process.exit(failed.length === 0 ? 0 : 1)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

// 追加要望2026.08.05の実測検証（headless Chrome）。
// ①福利厚生の動画差し替え ②製品「プロダクト全15品」改称＋動画差し替え ③§09トレーニング表示を確認する。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-req0805.cjs
const { chromium } = require('playwright')
const { loginAsMember, loginAsAdmin } = require('./_login.cjs')

const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = process.env.BASE || 'http://localhost:3100'
// 旧値は「消えたこと」を判定するための期待値なので、このファイルにだけリテラルで残す。
// 実装側（lib/components/app）と他の検証スクリプトに旧値が残っていないことは、
//   grep -rn "B_Cd-YQ1h30\|PKTwEWA5n3A\|全14品" lib components app scripts --exclude=verify-req0805.cjs
// が 0 件であることで担保する。
const NEW_WELFARE = 'a5CTH5irn6I'
const OLD_WELFARE = 'B_Cd-YQ1h30'
const NEW_PRODUCT = '4gJvVLprXJg'
const OLD_PRODUCT = 'PKTwEWA5n3A'
const OLD_PRODUCT_TAB = 'プロダクト全14品'
const OLD_PRODUCT_TITLE = '製品（プロダクト全14品）'
const PRODUCT_TABS = ['パーソナル', '全15品', 'BELLEQUAGE', 'インナーケア']
const PRODUCT_IDS = ['tuSEuVC6SQU', '4gJvVLprXJg', 'XOo-ifRXVBw', 'cbi5ySSheBA']
const PROTECTED_IDS = ['KUYqhhJ_VMY', '1Pf9pBZKcHs', 'AcxykSFFl4o', 'Q2aHPK7DaBE', ...PRODUCT_IDS]
const TRAINING_IDS = ['MSmZCalPv8k', '_dI-H_n7-Hs', 'VGE1ldPVLK8', 'ZC0cfGnM3RU', 'n-XHJeTc2Lc', 'H3ZscAXE4w8', 'hWvsTr2v1Co', 'xj6dIKdqo1c', NEW_WELFARE]

const sectionData = (page, num) => page.evaluate((n) => {
  const sec = document.querySelector(`#sec-${n}`)?.closest('section')
  if (!sec) return { found: false, text: '', ids: [], gates: 0 }
  const ids = [...sec.querySelectorAll('img')]
    .map((i) => (i.src.match(/\/vi\/([\w-]{11})\//) || [])[1])
    .filter(Boolean)
  return {
    found: true,
    text: sec.textContent,
    ids,
    gates: sec.querySelectorAll('input[placeholder="合言葉"]').length,
  }
}, num)

// スクショ用スクロール。element.scrollIntoView() は globals.css の scroll-behavior:smooth と
// scroll-anchor の影響で狙った位置に止まらないため、既存スクリプトと同じ window.scrollTo 方式を使う。
const scrollToSection = (page, num) => page.evaluate((n) => {
  const sec = document.querySelector(`#sec-${n}`)?.closest('section')
  if (!sec) return false
  window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  return true
}, num)

;(async () => {
  const results = []
  const check = (name, pass, detail = '') => {
    results.push({ name, pass: !!pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  await loginAsMember(page, BASE)
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1200)

  // 会員ログイン直後
  const training = await sectionData(page, '09')
  const welfare = await page.evaluate((newId) => {
    const sec = document.querySelector('#sec-09')?.closest('section')
    const title = [...(sec?.querySelectorAll('p') || [])].find((p) => p.textContent.trim() === '福利厚生')
    const ids = [...(title?.parentElement?.querySelectorAll('img') || [])]
      .map((i) => (i.src.match(/\/vi\/([\w-]{11})\//) || [])[1]).filter(Boolean)
    return { titleFound: !!title, count: ids.filter((id) => id === newId).length, ids }
  }, NEW_WELFARE)
  check('1. §09福利厚生のサムネIDが新ID', welfare.titleFound && welfare.count === 1, JSON.stringify(welfare))

  const pageHtml = await page.evaluate(() => document.documentElement.outerHTML)
  const rawHtml = await page.evaluate(async () => (await fetch('/', { credentials: 'same-origin' })).text())
  check('2. 旧福利厚生IDが全ページに0件', !pageHtml.includes(OLD_WELFARE) && !rawHtml.includes(OLD_WELFARE), JSON.stringify({ page: pageHtml.includes(OLD_WELFARE), raw: rawHtml.includes(OLD_WELFARE) }))

  check('6. §09に合言葉入力が0個', training.found && training.gates === 0, `gates=${training.gates}`)

  const trainingFound = TRAINING_IDS.filter((id) => training.ids.includes(id))
  check('7. §09はサムネ9本・準備中0・バッジ「公開 9 / 全 9」', trainingFound.length === 9 && !training.text.includes('準備中') && training.text.includes('公開 9 / 全 9'), JSON.stringify({ found: trainingFound.length, ready: !training.text.includes('準備中'), badge: training.text.includes('公開 9 / 全 9') }))

  const locked = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('#hub a[href^="#sec-"]')]
    const keyed = tiles.filter((a) => a.querySelector('svg path[d^="M7 11V8a5 5 0 0110 0v3"]'))
    return {
      gates: document.querySelectorAll('input[placeholder="合言葉"]').length,
      keyed: keyed.map((a) => a.getAttribute('href')).sort(),
      trainingKeyed: !!tiles.find((a) => a.getAttribute('href') === '#sec-09')?.querySelector('svg path[d^="M7 11V8a5 5 0 0110 0v3"]'),
    }
  })
  check('9. ゲート0・Hub鍵アイコン0', locked.gates === 0 && locked.keyed.length === 0 && !locked.trainingKeyed, JSON.stringify(locked))

  const howTo = await sectionData(page, '11')
  check('10. §11使い方step3に翌日の再入力案内', howTo.text.includes('翌日はもう一度コードを入力'), howTo.text)

  const trainingBefore = [...training.ids].sort()
  await scrollToSection(page, '09')
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/qualia-req0805-09-training-locked.jpeg`, type: 'jpeg', quality: 82 })

  const tabs = await page.evaluate(() => {
    const sec = document.querySelector('#sec-08')?.closest('section')
    return [...(sec?.querySelectorAll('button') || [])].map((b) => b.textContent.trim())
  })
  check('3. §08タブラベルが全15品（旧ラベル0件）', PRODUCT_TABS.every((label) => tabs.includes(label)) && tabs.filter((label) => PRODUCT_TABS.includes(label)).length === PRODUCT_TABS.length && !tabs.includes(OLD_PRODUCT_TAB), JSON.stringify(tabs))

  const clicked = await page.evaluate((label) => {
    const sec = document.querySelector('#sec-08')?.closest('section')
    const button = sec && [...sec.querySelectorAll('button')].find((b) => b.textContent.trim() === label)
    if (!button) return false
    button.click()
    return true
  }, PRODUCT_TABS[1])
  await page.waitForTimeout(600)
  const product = await sectionData(page, '08')
  const htmlAfter = await page.evaluate(() => document.documentElement.outerHTML)
  check('4. §08 2番目タブの動画IDが新ID（旧ID0件）', clicked && product.ids.length === 1 && product.ids[0] === NEW_PRODUCT && !htmlAfter.includes(OLD_PRODUCT), JSON.stringify({ ids: product.ids, old: htmlAfter.includes(OLD_PRODUCT) }))

  check('5. §08カードのタイトルが製品（プロダクト全15品）', product.text.includes('製品（プロダクト全15品）') && !product.text.includes(OLD_PRODUCT_TITLE), product.text)

  const trainingAfter = (await sectionData(page, '09')).ids.sort()
  check('12. §08操作後も§09の9IDが完全一致', JSON.stringify(trainingAfter) === JSON.stringify(trainingBefore), JSON.stringify({ before: trainingBefore, after: trainingAfter }))

  await scrollToSection(page, '08')
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/qualia-req0805-08-products.jpeg`, type: 'jpeg', quality: 82 })

  // フェーズC: 別コンテキストで管理者ログイン
  const adminCtx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const adminPage = await adminCtx.newPage()
  await loginAsAdmin(adminPage, BASE)
  await adminPage.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 90000 })
  const adminText = await adminPage.evaluate(() => document.body.textContent)
  // 証跡に adminText 全文を出さない（7日分の入口コードと管理者パスワードが含まれるため。判定条件は不変）
  const adminHit = adminText.includes('本日の合言葉（サイトに入るコード）')
    && adminText.includes('JST 0:00 に自動で切り替わり、前日のコードは使えなくなります。')
  check('11. /admin説明文が日替わり入口コードの説明', adminHit,
    JSON.stringify({ 説明文一致: adminHit, len: adminText.length }))

  await adminCtx.close()
  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(JSON.stringify({ results, total: results.length, failCount: failed.length }, null, 2))
  console.log(failed.length === 0 ? 'ALL PASS' : `FAIL x${failed.length}`)
  process.exit(failed.length === 0 ? 0 : 1)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

// 追加要望2026.08.17の実測検証（headless Chrome・375px）。
// BMT差し替え、§08製品4タブと初期表示内への収まり、§13コンプライアンス動画を確認する。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-req0817.cjs
const { chromium } = require('playwright')
const { loginAsMember } = require('./_login.cjs')

const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = process.env.BASE || 'http://localhost:3100'
const NEW_BMT = '_dI-H_n7-Hs'
const OLD_BMT = 'Ps3ZD2amsAw'
const BMT_STAFF = '高橋剛輝（たかはしこうき）'
const PRODUCT_TABS = ['パーソナル', '全15品', 'BELLEQUAGE', 'インナーケア']
const PRODUCT_IDS = ['tuSEuVC6SQU', '4gJvVLprXJg', 'XOo-ifRXVBw', 'cbi5ySSheBA']
const PROTECTED_IDS = ['KUYqhhJ_VMY', '1Pf9pBZKcHs', 'AcxykSFFl4o', 'Q2aHPK7DaBE', ...PRODUCT_IDS]
// §13 法令遵守の解説動画は Layer1（§12 北村弁護士と同じ）。保護ID集合には含めない。
const COMPLIANCE_ID = '32djx73PG1k'

const sectionData = (page, num) => page.evaluate((n) => {
  const sec = document.querySelector(`#sec-${n}`)?.closest('section')
  if (!sec) return { found: false, text: '', ids: [] }
  const ids = [...sec.querySelectorAll('img,iframe')].map((el) => {
    const src = el.src || el.getAttribute('src') || ''
    return (src.match(/\/vi\/([\w-]{11})\//) || src.match(/(?:embed\/|[?&]v=)([\w-]{11})/) || [])[1]
  }).filter(Boolean)
  return { found: true, text: sec.textContent, ids }
}, num)

const scrollToSection = (page, num) => page.evaluate((n) => {
  const sec = document.querySelector(`#sec-${n}`)?.closest('section')
  if (!sec) return false
  window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  return true
}, num)

const tabsFit = (measurement) => {
  if (!measurement.found || measurement.tabs.length !== PRODUCT_TABS.length) return false
  const dimensionsVisible = measurement.tabs.every((tab) => tab.width > 0 && tab.height > 0)
  const rightmost = Math.max(...measurement.tabs.map((tab) => tab.right))
  const visibleRight = measurement.container.left + measurement.container.clientWidth
  const withinVisibleRight = rightmost <= visibleRight + 1
  const noHorizontalOverflow = measurement.container.scrollWidth <= measurement.container.clientWidth + 1
  return dimensionsVisible && withinVisibleRight && noHorizontalOverflow
}

// 判定式自体の両対照。tabsFit が「何も検出しない検査」になっていないことを、
// 陽性1件＋失敗要因ごとに分離した陰性4件で毎回固定してから実測に入る（1px は丸め誤差として許容）。
const verifyFitPredicate = () => {
  const positive = {
    found: true,
    tabs: PRODUCT_TABS.map((label, i) => ({ label, left: i * 80, right: i * 80 + 70, width: 70, height: 32 })),
    container: { left: 0, clientWidth: 320, scrollWidth: 320 },
  }
  const negatives = {
    // 右端がはみ出す（初期表示外）— 他の条件は陽性のまま
    rightOverflow: {
      ...positive,
      tabs: positive.tabs.map((tab, i) => (i === PRODUCT_TABS.length - 1 ? { ...tab, right: 322 } : tab)),
    },
    // コンテナが横スクロールしている — 座標は陽性のまま
    scrollOverflow: { ...positive, container: { ...positive.container, scrollWidth: 322 } },
    // タブが1つ潰れている（幅0）
    zeroSized: {
      ...positive,
      tabs: positive.tabs.map((tab, i) => (i === PRODUCT_TABS.length - 1 ? { ...tab, width: 0 } : tab)),
    },
    // タブ数が足りない（追加したタブが描画されていない）
    missingTab: { ...positive, tabs: positive.tabs.slice(0, PRODUCT_TABS.length - 1) },
  }
  return {
    positive: tabsFit(positive),
    negatives: Object.fromEntries(Object.entries(negatives).map(([k, v]) => [k, tabsFit(v)])),
  }
}

;(async () => {
  const results = []
  const check = (name, pass, detail = '') => {
    results.push({ name, pass: !!pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  const predicateControl = verifyFitPredicate()
  const negativeAllFalse = Object.values(predicateControl.negatives).every((v) => v === false)
  if (!predicateControl.positive || !negativeAllFalse) {
    throw new Error(`375px判定ロジックの両対照に失敗: ${JSON.stringify(predicateControl)}`)
  }
  console.log(`375px判定ロジック両対照: ${JSON.stringify(predicateControl)}`)

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  await loginAsMember(page, BASE)
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1200)

  // 会員ログイン直後
  const rawHtml = await page.evaluate(async () => (await fetch('/', { credentials: 'same-origin' })).text())
  const domBefore = await page.evaluate(() => document.documentElement.outerHTML)
  const rscPayload = await page.evaluate(() => [...document.querySelectorAll('script')]
    .filter((script) => script.textContent.includes('self.__next_f'))
    .map((script) => script.textContent).join('\n'))
  const leakage = {
    rawHtml: PROTECTED_IDS.filter((id) => rawHtml.includes(id)),
    rscPayload: PROTECTED_IDS.filter((id) => rscPayload.includes(id)),
    dom: PROTECTED_IDS.filter((id) => domBefore.includes(id)),
  }
  check(`8. ログイン後に保護${PROTECTED_IDS.length}IDが生HTML・RSC・DOMへ表示`,
    leakage.rawHtml.length === PROTECTED_IDS.length && leakage.rscPayload.length === PROTECTED_IDS.length && leakage.dom.length === PROTECTED_IDS.length,
    JSON.stringify(leakage))

  const locked = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('#hub a[href^="#sec-"]')]
    const keyed = tiles.filter((a) => a.querySelector('svg path[d^="M7 11V8a5 5 0 0110 0v3"]'))
      .map((a) => a.getAttribute('href')).sort()
    return { keyed, count: keyed.length }
  })
  check('9. Hub鍵アイコンは0個', locked.count === 0, JSON.stringify(locked))

  const training = await sectionData(page, '09')
  const bmt = await page.evaluate(([newId, staff]) => {
    const sec = document.querySelector('#sec-09')?.closest('section')
    const title = [...(sec?.querySelectorAll('p') || [])].find((p) => p.textContent.trim() === 'BMT')
    const card = title?.parentElement
    const ids = [...(card?.querySelectorAll('img,iframe') || [])].map((el) => {
      const src = el.src || el.getAttribute('src') || ''
      return (src.match(/\/vi\/([\w-]{11})\//) || src.match(/(?:embed\/|[?&]v=)([\w-]{11})/) || [])[1]
    }).filter(Boolean)
    const staffText = title?.nextElementSibling?.textContent.trim() || ''
    return { titleFound: !!title, ids, newIdCount: ids.filter((id) => id === newId).length, staffText, expectedStaff: `担当：${staff}` }
  }, [NEW_BMT, BMT_STAFF])
  const oldBmtCounts = {
    rawHtml: rawHtml.split(OLD_BMT).length - 1,
    dom: domBefore.split(OLD_BMT).length - 1,
  }
  check('1. §09 BMTを新IDへ差し替え・旧IDはページ全体0件',
    bmt.newIdCount === 1 && oldBmtCounts.rawHtml === 0 && oldBmtCounts.dom === 0,
    JSON.stringify({ foundIds: bmt.ids, oldBmtCounts }))
  check(`2. BMT担当表記は${BMT_STAFF}`, bmt.staffText === bmt.expectedStaff, JSON.stringify({ actual: bmt.staffText, expected: bmt.expectedStaff }))
  check('3. §09は9本・バッジ「公開 9 / 全 9」',
    training.ids.length === 9 && training.text.includes('公開 9 / 全 9'),
    JSON.stringify({ ids: training.ids, count: training.ids.length, badge: training.text.includes('公開 9 / 全 9') }))

  // §13 法令遵守: 解説動画が会員ログイン後に見えていること
  const compliance = await sectionData(page, '13')
  const complianceCard = await page.evaluate((id) => {
    const sec = document.querySelector('#sec-13')?.closest('section')
    if (!sec) return { found: false }
    const players = [...sec.querySelectorAll('img,iframe')].map((el) => {
      const src = el.src || el.getAttribute('src') || ''
      return (src.match(/\/vi\/([\w-]{11})\//) || src.match(/(?:embed\/|[?&]v=)([\w-]{11})/) || [])[1]
    }).filter(Boolean)
    const caption = [...sec.querySelectorAll('p')].map((p) => p.textContent.trim()).find((t) => t === 'コンプライアンス') || ''
    const pdf = [...sec.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter(Boolean)
    return { found: true, players, matched: players.filter((v) => v === id).length, caption, pdf }
  }, COMPLIANCE_ID)
  check('10. §13にコンプライアンス動画1本',
    complianceCard.found && complianceCard.matched === 1 && complianceCard.players.length === 1,
    JSON.stringify(complianceCard))
  check('11. §13の動画カード見出しが「コンプライアンス」',
    complianceCard.caption === 'コンプライアンス', JSON.stringify({ caption: complianceCard.caption }))
  check('12. コンプライアンス動画IDは保護ID集合に含まれない（Layer1）',
    !PROTECTED_IDS.includes(COMPLIANCE_ID) && compliance.ids.includes(COMPLIANCE_ID),
    JSON.stringify({ inProtected: PROTECTED_IDS.includes(COMPLIANCE_ID), inSection: compliance.ids }))

  // §13 の PDF は従来どおり存在し、Cookie 無しでは middleware が /enter へ落とす（回帰）
  const pdfHref = (complianceCard.pdf || []).includes('/docs/compliance.pdf')
  const guestPdf = await fetch(new URL('/docs/compliance.pdf', BASE), { redirect: 'manual' })
  check('13. §13のPDFボタンが残存し、無Cookieでは307（会員ゲート回帰）',
    pdfHref && guestPdf.status === 307,
    JSON.stringify({ pdfHref, guestStatus: guestPdf.status, links: complianceCard.pdf }))

  // §08 内の button は動画プレーヤーの再生ボタン（テキスト無し）も含むため、
  // タブ行コンテナ（最初のタブラベルを持つ button の親）に絞ってから列挙する。
  const tabs = await page.evaluate((labels) => {
    const sec = document.querySelector('#sec-08')?.closest('section')
    const first = sec && [...sec.querySelectorAll('button')].find((b) => labels.includes(b.textContent.trim()))
    const row = first?.parentElement
    return [...(row?.querySelectorAll(':scope > button') || [])].map((button) => button.textContent.trim())
  }, PRODUCT_TABS)
  check(`4. §08ログイン後のタブは${PRODUCT_TABS.length}つ・指定順`,
    JSON.stringify(tabs) === JSON.stringify(PRODUCT_TABS), JSON.stringify({ tabs, count: tabs.length }))

  const productViews = []
  for (let i = 0; i < PRODUCT_TABS.length; i++) {
    const clicked = await page.evaluate((label) => {
      const sec = document.querySelector('#sec-08')?.closest('section')
      const button = sec && [...sec.querySelectorAll('button')].find((b) => b.textContent.trim() === label)
      if (!button) return false
      button.click()
      return true
    }, PRODUCT_TABS[i])
    await page.waitForTimeout(500)
    const product = await sectionData(page, '08')
    productViews.push({ label: PRODUCT_TABS[i], clicked, ids: product.ids, text: product.text })
  }
  check('5. §08各タブは順対応する動画1本だけ描画',
    productViews.every((view, i) => view.clicked && view.ids.length === 1 && view.ids[0] === PRODUCT_IDS[i]),
    JSON.stringify(productViews.map(({ label, clicked, ids }) => ({ label, clicked, ids }))))
  check('6. §08カード見出しは2番目・4番目とも指定どおり',
    productViews[1]?.text.includes('製品（プロダクト全15品）') && productViews[3]?.text.includes('製品（インナーケア）'),
    JSON.stringify({ second: productViews[1]?.text, fourth: productViews[3]?.text }))

  const measurement = await page.evaluate((labels) => {
    const sec = document.querySelector('#sec-08')?.closest('section')
    const buttons = [...(sec?.querySelectorAll('button') || [])].filter((button) => labels.includes(button.textContent.trim()))
    const container = buttons[0]?.parentElement
    if (!container) return { found: false, tabs: [], container: {} }
    const containerRect = container.getBoundingClientRect()
    return {
      found: true,
      tabs: buttons.map((button) => {
        const rect = button.getBoundingClientRect()
        return { label: button.textContent.trim(), left: rect.left, right: rect.right, width: rect.width, height: rect.height }
      }),
      container: { left: containerRect.left, right: containerRect.right, scrollWidth: container.scrollWidth, clientWidth: container.clientWidth },
    }
  }, PRODUCT_TABS)
  check('7. 375pxで§08の4タブが横スクロールなしで初期表示内', tabsFit(measurement), JSON.stringify(measurement))

  await scrollToSection(page, '08')
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/qualia-req0817-08-products-375.jpeg`, type: 'jpeg', quality: 82 })

  await browser.close()
  const failed = results.filter((result) => !result.pass)
  console.log(JSON.stringify({ results, total: results.length, passCount: results.length - failed.length, failCount: failed.length }, null, 2))
  console.log(failed.length === 0 ? 'ALL PASS' : `FAIL x${failed.length}`)
  process.exit(failed.length === 0 ? 0 : 1)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

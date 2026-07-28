// 追加要望7/28の実測検証（headless Chrome）。
// §12副業・§13法令遵守・§14 FAQ、§08製品3タブ、§09担当変更、PDF会員ゲートを確認する。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-req0728.cjs
const { chromium } = require('playwright')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const BASE = process.env.BASE || 'http://localhost:3100'
const PLAN_IDS = ['KUYqhhJ_VMY', '1Pf9pBZKcHs', 'AcxykSFFl4o', 'Q2aHPK7DaBE']
const PRODUCT_IDS = ['tuSEuVC6SQU', 'PKTwEWA5n3A', 'XOo-ifRXVBw']
const PRODUCT_TABS = ['パーソナル', 'プロダクト全14品', 'BELLEQUAGE']
const TRAINING_IDS = ['MSmZCalPv8k', 'Ps3ZD2amsAw', 'VGE1ldPVLK8', 'ZC0cfGnM3RU', 'n-XHJeTc2Lc', 'H3ZscAXE4w8', 'hWvsTr2v1Co', 'xj6dIKdqo1c', 'B_Cd-YQ1h30']
const PROTECTED_IDS = [...PLAN_IDS, ...PRODUCT_IDS, ...TRAINING_IDS]

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

;(async () => {
  const results = []
  const check = (name, pass, detail = '') => {
    results.push({ name, pass: !!pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'qualia2026' }),
    })
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1200)

  const sections = await page.evaluate(() => {
    const read = (num) => {
      const head = document.querySelector(`#sec-${num}`)
      const sec = head?.closest('section')
      return {
        title: head?.querySelector('h2')?.textContent.trim() || '',
        eyebrow: head?.querySelector('p')?.textContent.trim() || '',
        text: sec?.textContent || '',
        ids: sec ? [...sec.querySelectorAll('img,iframe')].map((el) => {
          const src = el.src || el.getAttribute('src') || ''
          return (src.match(/\/vi\/([\w-]{11})\//) || src.match(/(?:embed\/|[?&]v=)([\w-]{11})/) || [])[1]
        }).filter(Boolean) : [],
        comingSoon: sec ? (sec.textContent.match(/準備中/g) || []).length : 0,
      }
    }
    return { s12: read('12'), s13: read('13'), s14: read('14') }
  })
  check('1. §12章扉タイトル＋eyebrow', sections.s12.title === '北村弁護士の副業のすすめ' && sections.s12.eyebrow === 'SIDE BUSINESS', JSON.stringify(sections.s12))
  check('2. §12動画表示＋準備中0', sections.s12.ids.includes('yWXjj0n27GQ') && sections.s12.comingSoon === 0, JSON.stringify({ ids: sections.s12.ids, comingSoon: sections.s12.comingSoon }))
  check('3. §13章扉タイトル＋eyebrow', sections.s13.title === '法令遵守' && sections.s13.eyebrow === 'COMPLIANCE', JSON.stringify(sections.s13))

  const compliance = await page.evaluate(() => {
    const sec = document.querySelector('#sec-13')?.closest('section')
    const links = [...(sec?.querySelectorAll('a[href="/docs/compliance.pdf"][target="_blank"]') || [])]
    return {
      count: links.length,
      rel: links[0]?.getAttribute('rel') || '',
      label: links[0]?.textContent || '',
      text: sec?.textContent || '',
    }
  })
  check('4. §13 PDF金ボタン＋会員限定注記', compliance.count === 1 && compliance.rel.includes('noopener') && compliance.label.includes('コンプライアンス資料') && compliance.text.includes('会員限定'), JSON.stringify(compliance))
  check('5. FAQは§14', sections.s14.title === 'よくある質問', sections.s14.title)
  check('6. §12に旧FAQタイトルなし', sections.s12.title !== 'よくある質問', sections.s12.title)

  const hub = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('#hub a[href^="#sec-"]')]
    return { count: tiles.length, text: tiles.map((a) => a.textContent.trim()) }
  })
  check('7. Hubは14タイル＋新2項目', hub.count === 14 && hub.text.some((t) => t.includes('北村弁護士の副業のすすめ')) && hub.text.some((t) => t.includes('法令遵守')), JSON.stringify(hub))

  const initialHtml = await page.evaluate(async () => (await fetch('/', { credentials: 'same-origin' })).text())
  const leaked = PROTECTED_IDS.filter((id) => initialHtml.includes(id))
  check('8. 初期HTMLに保護16IDなし', leaked.length === 0, leaked.join(',') || 'clean')

  const code = todayCode()
  const unlocked = await page.evaluate((c) => {
    const sec = document.querySelector('#sec-04')?.closest('section')
    const input = sec?.querySelector('input[placeholder="合言葉"]')
    const button = sec && [...sec.querySelectorAll('button')].find((b) => b.textContent.includes('解除する'))
    if (!input || !button) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, c)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    button.click()
    return true
  }, code)
  await page.waitForTimeout(2500)

  const training = await page.evaluate(() => {
    const sec = document.querySelector('#sec-09')?.closest('section')
    const title = [...(sec?.querySelectorAll('p') || [])].find((p) => p.textContent.trim() === '噛み砕き')
    return {
      unlocked: !sec?.querySelector('input[placeholder="合言葉"]'),
      staff: title?.nextElementSibling?.textContent.trim() || '',
      oldCount: [...(sec?.querySelectorAll('p') || [])].filter((p) => p.textContent.includes('担当：竹之内尚也')).length,
    }
  })
  check('9. §09噛み砕き担当変更', unlocked && training.unlocked && training.staff === '担当：伴隆（ばんたかし）' && training.oldCount === 0, JSON.stringify(training))

  const tabs = await page.evaluate(() => {
    const sec = document.querySelector('#sec-08')?.closest('section')
    return [...(sec?.querySelectorAll('button') || [])].map((b) => b.textContent.trim())
  })
  check('10. §08製品タブ3ラベル', PRODUCT_TABS.every((label) => tabs.includes(label)) && tabs.filter((label) => PRODUCT_TABS.includes(label)).length === 3, JSON.stringify(tabs))

  const observedIds = new Set()
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
    const ids = await page.evaluate(() => {
      const sec = document.querySelector('#sec-08')?.closest('section')
      return sec ? [...sec.querySelectorAll('img,iframe')]
        .map((el) => {
          const src = el.src || el.getAttribute('src') || ''
          return (src.match(/\/vi\/([\w-]{11})\//) || src.match(/(?:embed\/|[?&]v=)([\w-]{11})/) || [])[1]
        })
        .filter(Boolean) : []
    })
    ids.forEach((id) => observedIds.add(id))
    productViews.push({ label: PRODUCT_TABS[i], clicked, ids })
  }
  check('11. §08各タブは対応動画1本のみ', productViews.every((view, i) => view.clicked && view.ids.length === 1 && view.ids[0] === PRODUCT_IDS[i]), JSON.stringify(productViews))

  const visibleProtected = await page.evaluate(() => [...document.querySelectorAll('img,iframe')]
    .map((el) => {
      const src = el.src || el.getAttribute('src') || ''
      return (src.match(/\/vi\/([\w-]{11})\//) || src.match(/(?:embed\/|[?&]v=)([\w-]{11})/) || [])[1]
    })
    .filter(Boolean))
  visibleProtected.forEach((id) => observedIds.add(id))
  const missing = PROTECTED_IDS.filter((id) => !observedIds.has(id))
  check('12. 解除後の保護動画16IDを確認', missing.length === 0, missing.join(',') || 'all 16')

  const pdfUrl = new URL('/docs/compliance.pdf', BASE)
  const guestPdf = await fetch(pdfUrl, { redirect: 'manual' })
  const guestLocation = guestPdf.headers.get('location') || ''
  check('13. CookieなしPDFは/enterへ3xx', guestPdf.status >= 300 && guestPdf.status < 400 && new URL(guestLocation, BASE).pathname === '/enter', `status=${guestPdf.status}, location=${guestLocation}`)

  const cookies = await ctx.cookies(BASE)
  const cookieHeader = cookies.map(({ name, value }) => `${name}=${value}`).join('; ')
  const memberPdf = await fetch(pdfUrl, { redirect: 'manual', headers: { Cookie: cookieHeader } })
  const contentType = memberPdf.headers.get('content-type') || ''
  const contentLength = Number(memberPdf.headers.get('content-length') || 0)
  check('14. Layer1 CookieありPDFは200＋application/pdf', memberPdf.status === 200 && contentType.includes('application/pdf'), `status=${memberPdf.status}, content-type=${contentType}`)
  check('15. PDF Content-Lengthは1,900,000以上', contentLength >= 1900000, `content-length=${contentLength}`)

  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(JSON.stringify({ results, total: results.length, failCount: failed.length }, null, 2))
  console.log(failed.length === 0 ? 'ALL PASS' : `FAIL x${failed.length}`)
  process.exit(failed.length === 0 ? 0 : 1)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

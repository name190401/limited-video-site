// 追加要望7/21の実測検証（headless Chrome・375px）
// 1) §03/§05 の新名称（章扉・Hub・メニュー・eyebrow）＋旧名称の残存0
// 2) §02 講師14名のふりがな表示＋はみ出しなし
// 3) §09 トレーニング担当者名（Layer2解除後）＋語中改行なし
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-req0721.cjs
const { chromium } = require('playwright')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = process.env.BASE || 'http://localhost:3100'

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

const FURIGANA = [
  ['石井諒', 'いしいりょう'], ['久保田幸世', 'くぼたさちよ'], ['中村佳世', 'なかむらかよ'],
  ['阿部美道', 'あべはるただ'], ['竹之内尚也', 'たけのうちなおや'], ['高橋剛輝', 'たかはしこうき'],
  ['岡田由加里', 'おかだゆかり'], ['中矢真理', 'なかやまり'], ['西野将平', 'にしのしょうへい'],
  ['丹治郁子', 'たんじいくこ'], ['伴隆', 'ばんたかし'], ['中村正人', 'なかむらまさと'],
  ['小林一貴', 'こばやしかずき'], ['宮地百絵', 'みやじももえ'],
]
const TRAINING = [
  ['FA', '中村佳世（なかむらかよ）'], ['BMT', '高橋剛輝（たかはしこうき）'],
  ["Woman's Life", '阿部美道（あべはるただ）'], ['経済セミナー', 'みっくん'],
  ['ルーツ', '小林一貴（こばやしかずき）'], ['噛み砕き', '伴隆（ばんたかし）'],
  ['フレッシュ', '中村正人（なかむらまさと）'], ['MAPの書き方', 'みっくん'],
  ['福利厚生', '丹治郁子（たんじいくこ）'],
]

;(async () => {
  const results = []
  const consoleErrors = []
  const ok = (name, pass, detail = '') => results.push({ name, pass, detail })

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })

  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'qualia2026' }),
    })
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 })

  // ── 1) セクション名 ──
  const nameChecks = await page.evaluate(() => {
    const bodyText = document.body.innerText
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map((e) => e.textContent.trim())
    return {
      opening: heads.some((t) => t.includes('オープニング')),
      ending: heads.some((t) => t.includes('エンディング')),
      oldEar: bodyText.includes('耳開け') || bodyText.includes('耳空け'),
      oldClosing: bodyText.includes('クロージング'),
      eyebrowOpening: bodyText.includes('OPENING'),
      eyebrowEnding: bodyText.includes('ENDING'),
      oldEyebrow: /\bINTRODUCTION\b/.test(bodyText) || /(^|[^E])CLOSING/.test(bodyText),
    }
  })
  ok('§03 章扉「オープニング」', nameChecks.opening)
  ok('§05 章扉「エンディング」', nameChecks.ending)
  ok('旧「耳開け/耳空け」残存なし', !nameChecks.oldEar)
  ok('旧「クロージング」残存なし', !nameChecks.oldClosing)
  ok('eyebrow OPENING', nameChecks.eyebrowOpening)
  ok('eyebrow ENDING', nameChecks.eyebrowEnding)
  ok('旧 eyebrow (INTRODUCTION/CLOSING) 残存なし', !nameChecks.oldEyebrow)

  // ハンバーガーメニュー内の表記
  const menuBtn = await page.$('button[aria-label*="メニュー"], button[aria-label*="menu"], header button')
  if (menuBtn) {
    await menuBtn.click()
    await page.waitForTimeout(600)
    const menu = await page.evaluate(() => {
      const t = document.body.innerText
      return { opening: t.includes('オープニング'), ending: t.includes('エンディング'), old: t.includes('耳開け') || t.includes('クロージング') }
    })
    ok('メニューに「オープニング」「エンディング」', menu.opening && menu.ending)
    ok('メニューに旧名称なし', !menu.old)
    // メニューを閉じる（×ボタン。だめならリロードで復帰）
    const closed = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => {
        const a = (b.getAttribute('aria-label') || '') + b.textContent
        return a.includes('閉じる') || a.includes('close') || b.textContent.trim() === '×'
      })
      if (btn) { btn.click(); return true }
      return false
    })
    if (!closed) await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(800)
  } else {
    ok('メニューボタン検出', false, 'ハンバーガーが見つからない')
  }

  // ── 2) §02 ふりがな 14名 ──
  for (const [name, kana] of FURIGANA) {
    const r = await page.evaluate(([nm, kn]) => {
      const h = [...document.querySelectorAll('h3')].find((e) => e.textContent.trim() === nm)
      if (!h) return { found: false }
      const sib = h.nextElementSibling
      const kanaEl = sib && sib.textContent.trim() === kn ? sib : null
      if (!kanaEl) return { found: true, kana: false, actual: sib ? sib.textContent.trim() : '(なし)' }
      const rect = kanaEl.getBoundingClientRect()
      const overflowX = rect.right > window.innerWidth + 1 || rect.left < -1
      const clipped = kanaEl.scrollWidth > kanaEl.clientWidth + 1
      return { found: true, kana: true, overflowX, clipped }
    }, [name, kana])
    ok(`§02 ${name} ふりがな「${kana}」`, !!(r.found && r.kana && !r.overflowX && !r.clipped),
      r.found ? (r.kana ? '' : `かな不一致: ${r.actual}`) : '氏名h3なし')
  }

  // §02 スクショ（主役帯＋先頭カード）
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('講師紹介'))
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/qualia-req0721-sec02-furigana.jpeg`, type: 'jpeg', quality: 82 })

  // ── 3) Layer2 解除（§04ゲートのUIから・verify-layer2と同方式）→ §09 担当者名 ──
  const code = todayCode()
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
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('プラン説明'))
    const sec = h ? (h.closest('section') || h.parentElement) : null
    const btn = sec && [...sec.querySelectorAll('button')].find((b) => b.textContent.includes('解除する'))
    if (btn) btn.click()
  })
  await page.waitForTimeout(2500)
  ok('Layer2 解除（§04ゲート入力→解除）', typed)

  for (const [title, staff] of TRAINING) {
    const r = await page.evaluate(([tt, st]) => {
      const tEl = [...document.querySelectorAll('p')].find((e) => e.textContent.trim() === tt)
      if (!tEl) return { found: false }
      const sib = tEl.nextElementSibling
      const want = `担当：${st}`
      if (!sib || sib.textContent.trim() !== want)
        return { found: true, staff: false, actual: sib ? sib.textContent.trim() : '(なし)' }
      // 語中改行チェック: 行数と、行末が名前の途中（かな括弧の内側で開き括弧直後以外）で割れていないか
      const rect = sib.getBoundingClientRect()
      const overflowX = rect.right > window.innerWidth + 1
      const clipped = sib.scrollWidth > sib.clientWidth + 1
      return { found: true, staff: true, overflowX, clipped }
    }, [title, staff])
    ok(`§09 ${title} → 担当：${staff}`, !!(r.found && r.staff && !r.overflowX && !r.clipped),
      r.found ? (r.staff ? '' : `不一致: ${r.actual}`) : 'タイトルなし')
  }

  // §09 スクショ
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('トレーニング'))
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/qualia-req0721-sec09-staff.jpeg`, type: 'jpeg', quality: 82 })
  await page.evaluate(() => window.scrollBy({ top: 840, behavior: 'instant' }))
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/qualia-req0721-sec09-staff2.jpeg`, type: 'jpeg', quality: 82 })

  ok('console エラー 0', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

  await browser.close()
  const fail = results.filter((r) => !r.pass)
  console.log(JSON.stringify({ results, failCount: fail.length }, null, 2))
  console.log(fail.length === 0 ? 'ALL PASS' : `FAIL x${fail.length}`)
  process.exit(fail.length === 0 ? 0 : 1)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

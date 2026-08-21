// 日替わり会員コード・セッション・1層化・抑止パッケージ・ログアウトの総合回帰検証。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-auth.cjs
const { chromium } = require('playwright')
const crypto = require('crypto')
const { todayCode, readEnv, readEnvOptional } = require('./_login.cjs')

const BASE = process.env.BASE || 'http://localhost:3100'
const PLAN_IDS = ['KUYqhhJ_VMY', '1Pf9pBZKcHs', 'AcxykSFFl4o', 'Q2aHPK7DaBE']
const PRODUCT_IDS = ['tuSEuVC6SQU', '4gJvVLprXJg', 'XOo-ifRXVBw', 'cbi5ySSheBA']
const TRAINING_IDS = ['MSmZCalPv8k', '_dI-H_n7-Hs', 'VGE1ldPVLK8', 'ZC0cfGnM3RU', 'n-XHJeTc2Lc', 'H3ZscAXE4w8', 'hWvsTr2v1Co', 'xj6dIKdqo1c', 'a5CTH5irn6I']

function jstDate(offsetDays = 0) {
  const date = new Date(Date.now() + (9 * 60 * 60 + offsetDays * 24 * 60 * 60) * 1000)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function nextJstMidnightEpoch() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) / 1000 - 9 * 60 * 60
}

function decodePayload(value) {
  const part = value.split('.')[0]
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const results = []
  const check = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })
  const login = async (password) => {
    await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    return page.evaluate(async (value) => (await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: value }),
    })).status, password)
  }

  const code = todayCode()
  const variants = [
    ['当日コード', code, 200],
    ['小文字', code.toLowerCase(), 200],
    ['前後半角スペース', ` ${code} `, 200],
    ['全角', code.replace(/[A-Z0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0)), 200],
    ['前日コード', todayCode(-1), 401],
    ['翌日コード', todayCode(1), 401],
    ['空文字', '', 401],
    ['固定合言葉風の任意文字列', 'FixedPassphraseStyleString', 401],
  ]
  // 固定合言葉の撤去回帰。資格情報そのものはソースに書かず、環境に残っている旧値を読んで当てる。
  // 旧 SITE_PASSWORD を消したあとは、上の「固定合言葉風の任意文字列」が同じ意図を担う。
  const legacySitePassword = readEnvOptional('SITE_PASSWORD')
  if (legacySitePassword) variants.push(['旧 SITE_PASSWORD（環境に残存）', legacySitePassword, 401])
  for (const [name, password, expected] of variants) {
    const status = await login(password)
    check(`${name} → ${expected}`, status === expected, `status=${status}`)
  }

  const sessionResponse = await fetch(`${BASE}/api/auth/layer1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: code }),
  })
  const setCookie = sessionResponse.headers.getSetCookie?.()[0] ?? sessionResponse.headers.get('set-cookie') ?? ''
  const cookieMatch = setCookie.match(/(?:^|,\s*)qualia_site=([^;]+)/)
  const cookieValue = cookieMatch ? decodeURIComponent(cookieMatch[1]) : ''
  const status = sessionResponse.status
  check('セッション検証用ログイン → 200', status === 200, `status=${status}`)
  if (cookieValue) await ctx.addCookies([{ name: 'qualia_site', value: cookieValue, url: `${BASE}/` }])
  const home = await page.request.get(`${BASE}/`, { maxRedirects: 0 })
  check('ログイン直後の / → 200', home.status() === 200, `status=${home.status()}`)

  const payload = cookieValue ? decodePayload(cookieValue) : null
  const expectedPayload = { v: 2, t: 'l1', d: jstDate(), exp: nextJstMidnightEpoch() }
  check('Cookie payload が v2・l1・今日・翌JST 0:00', JSON.stringify(payload) === JSON.stringify(expectedPayload), JSON.stringify(payload))
  check('Set-Cookie に Max-Age/Expires なし', !!setCookie && !/(?:max-age|expires)=/i.test(setCookie), setCookie)

  // 旧 Cookie の一斉失効と日付判定は、正しい鍵で署名した Cookie を自作しないと測れない。
  // 署名形式は lib/crypto-token.js と同じ base64url(JSON) + '.' + base64url(HMAC-SHA256)。
  const sessionSecret = readEnv('SESSION_SECRET')
  const b64url = (input) => Buffer.from(input).toString('base64url')
  const sign = (payloadObject) => {
    const body = b64url(JSON.stringify(payloadObject))
    return `${body}.${b64url(crypto.createHmac('sha256', sessionSecret).update(body).digest())}`
  }
  const rootWithCookie = async (value) => {
    const response = await fetch(`${BASE}/`, {
      redirect: 'manual',
      headers: { cookie: `qualia_site=${encodeURIComponent(value)}` },
    })
    return { status: response.status, location: response.headers.get('location') || '' }
  }
  const v1 = await rootWithCookie(sign({ v: 1, t: 'l1', pv: 0, exp: Math.floor(Date.now() / 1000) + 12 * 3600 }))
  check('旧 v1 Cookie（正しい署名）→ /enter（?e なし）',
    v1.status === 307 && v1.location.endsWith('/enter'), JSON.stringify(v1))
  // d と exp は独立に効く必要がある。片方だけを崩した Cookie を 1 通ずつ当てて切り分ける
  // （両方同時に崩すと、生き残っている片方の判定だけで 307 になり検査が素通しになる）。
  const staleDate = await rootWithCookie(sign({ v: 2, t: 'l1', d: jstDate(-1), exp: nextJstMidnightEpoch() }))
  check('昨日の日付・期限は未来の Cookie → /enter?e=day',
    staleDate.status === 307 && staleDate.location.includes('/enter?e=day'), JSON.stringify(staleDate))
  const staleExp = await rootWithCookie(sign({ v: 2, t: 'l1', d: jstDate(), exp: Math.floor(Date.now() / 1000) - 60 }))
  check('今日の日付・期限切れの Cookie → /enter?e=day',
    staleExp.status === 307 && staleExp.location.includes('/enter?e=day'), JSON.stringify(staleExp))
  const flip = cookieValue.slice(-1) === 'A' ? 'B' : 'A'
  const tampered = await rootWithCookie(`${cookieValue.slice(0, -1)}${flip}`)
  check('署名改竄 Cookie → /enter（?e なし）',
    tampered.status === 307 && tampered.location.endsWith('/enter'), JSON.stringify(tampered))
  await page.goto(`${BASE}/enter?e=day`, { waitUntil: 'networkidle', timeout: 60000 })
  check('/enter?e=day に日付変更の案内',
    (await page.content()).includes('日付が変わりました'))

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  const html = await page.content()
  check('§04 の4 IDが全て出る', PLAN_IDS.every((id) => html.includes(id)))
  check('§08 の4 IDが全て出る', PRODUCT_IDS.every((id) => html.includes(id)))
  check('§09 の9 IDが全て出る', TRAINING_IDS.every((id) => html.includes(id)))
  check('合言葉 input が0個', await page.locator('input[placeholder="合言葉"]').count() === 0)
  const keyCount = await page.evaluate(() => [...document.querySelectorAll('#hub a[href^="#sec-"]')]
    .filter((a) => a.querySelector('svg path[d^="M7 11V8a5 5 0 0110 0v3"]')).length)
  check('Hub鍵アイコンが0個', keyCount === 0, `count=${keyCount}`)
  for (const path of ['/api/auth/plan', '/api/plan/content', '/api/plan/status']) {
    const response = await page.request.get(`${BASE}${path}`, { maxRedirects: 0 })
    check(`${path} → 404`, response.status() === 404, `status=${response.status()}`)
  }

  await page.evaluate(() => {
    const sec = document.querySelector('#sec-04')?.closest('section')
    ;[...sec.querySelectorAll('button')].find((button) => button.querySelector('img'))?.click()
  })
  await page.waitForTimeout(2000)
  const watermark = await page.evaluate(() => ({
    marks: [...document.querySelectorAll('span')].filter((span) => /^QUALIA \d{4}\/\d{2}\/\d{2}/.test(span.textContent)).length,
    caption: document.body.textContent.includes('スクリーンショット・画面録画は禁止されています'),
  }))
  check('ウォーターマークが出る', watermark.marks >= 9 && watermark.caption, JSON.stringify(watermark))
  await page.keyboard.press('Escape')
  await page.keyboard.press('PrintScreen')
  await page.waitForTimeout(600)
  check('PrintScreen警告が出る', await page.evaluate(() => document.body.textContent.includes('スクリーンショットは禁止されています')))

  await page.request.post(`${BASE}/api/auth/logout`)
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  check('ログアウト後 / は /enter へ', page.url().includes('/enter'), page.url())

  await browser.close()
  const failed = results.filter((result) => !result.pass)
  console.log(JSON.stringify({ results, failCount: failed.length }, null, 2))
  process.exit(failed.length ? 1 : 0)
})().catch((error) => { console.error('ERR', error.stack || error.message); process.exit(2) })

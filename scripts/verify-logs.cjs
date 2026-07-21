// アクセスログ機能の E2E 検証（要: 稼働中 Supabase ＋ ENABLE_ACCESS_LOGS=true ＋ next start）
// 1) 会員ログイン→login_events(kind=member) 2) 管理者ログイン→(kind=admin)
// 3) Layer2解除(UI)→(kind=unlock) 4) /api/log/play→play_events 5) /admin に履歴・回数表示
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-logs.cjs
const { chromium } = require('playwright')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const BASE = process.env.BASE || 'http://localhost:3100'

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
const envVal = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const SUPA_URL = envVal('NEXT_PUBLIC_SUPABASE_URL')
const SUPA_KEY = envVal('SUPABASE_SERVICE_ROLE_KEY')

function todayCode() {
  const key = envVal('PASSWORD_SECRET_KEY')
  const jst = new Date(Date.now() + 9 * 3600 * 1000)
  const d = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, '0')}-${String(jst.getUTCDate()).padStart(2, '0')}`
  const hash = crypto.createHash('sha256').update(key + d + '0').digest('hex')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let p = ''
  for (let i = 0; i < 6; i++) p += chars[parseInt(hash.substr(i * 2, 2), 16) % chars.length]
  return p
}

async function countRows(table, filter = {}) {
  const q = new URLSearchParams({ select: 'id', ...filter })
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${q}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Prefer: 'count=exact', Range: '0-0' },
  })
  const range = res.headers.get('content-range') || ''
  return parseInt(range.split('/')[1] || '0', 10)
}

;(async () => {
  const results = []
  const ok = (name, pass, detail = '') => results.push({ name, pass, detail })

  // ベースライン件数
  const base = {
    member: await countRows('login_events', { kind: 'eq.member' }),
    admin: await countRows('login_events', { kind: 'eq.admin' }),
    unlock: await countRows('login_events', { kind: 'eq.unlock' }),
    play: await countRows('play_events'),
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })

  // 1) 会員ログイン
  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'qualia2026' }),
    })
  })
  await page.waitForTimeout(800)
  ok('会員ログイン→login_events(member) +1', await countRows('login_events', { kind: 'eq.member' }) === base.member + 1)

  // 2) Layer2 解除（§04ゲートUI）
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 })
  const code = todayCode()
  await page.evaluate((c) => {
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
  ok('Layer2解除→login_events(unlock) +1', await countRows('login_events', { kind: 'eq.unlock' }) === base.unlock + 1)

  // 3) 実プレーヤーで再生→play_events（§03 先頭動画のライトボックス→再生）
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('オープニング'))
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  })
  await page.waitForTimeout(600)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('オープニング'))
    const sec = h.closest('section') || h.parentElement
    const btn = [...sec.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('全画面で再生'))
    btn && btn.click()
  })
  // 自前コントロールの再生ボタンを押して s===1 を発火させる（自動再生は環境依存のため明示クリック）
  await page.waitForTimeout(2500)
  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]') || document.body
    const play = [...dlg.querySelectorAll('button')].find((b) => {
      const a = b.getAttribute('aria-label') || ''
      return a.includes('再生') && !a.includes('全画面')
    })
    play && play.click()
  })
  // 再生開始（s===1）→ /api/log/play 発火を待つ
  let playLogged = false
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1000)
    if (await countRows('play_events') === base.play + 1) { playLogged = true; break }
  }
  ok('実再生→play_events +1', playLogged, `base=${base.play}`)

  // 4) 管理者ログイン→/admin にログ表示
  const page2 = await ctx.newPage()
  await page2.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page2.evaluate(async () => {
    await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'qualia-admin-2026' }),
    })
  })
  await page2.waitForTimeout(800)
  ok('管理者ログイン→login_events(admin) +1', await countRows('login_events', { kind: 'eq.admin' }) === base.admin + 1)

  await page2.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 60000 })
  const adminView = await page2.evaluate(() => {
    const t = document.body.innerText
    return {
      hasPlays: t.includes('動画再生回数'),
      hasHistory: t.includes('ログイン履歴'),
      hasMemberRow: t.includes('会員ログイン'),
      hasUnlockRow: t.includes('コード解除'),
      hasCount: /\d+回/.test(t),
      noUnset: !t.includes('ログ記録は未設定です'),
    }
  })
  ok('/admin 再生回数セクション（○回表示）', adminView.hasPlays && adminView.hasCount)
  ok('/admin ログイン履歴（会員ログイン・コード解除の行）', adminView.hasHistory && adminView.hasMemberRow && adminView.hasUnlockRow)
  ok('/admin 未設定注記が消えている', adminView.noUnset)
  await page2.screenshot({ path: '/Users/hajime/Desktop/限定公開/_screenshots/qualia-logs-admin.jpeg', type: 'jpeg', quality: 82, fullPage: true })

  ok('console エラー 0', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

  await browser.close()
  const fail = results.filter((r) => !r.pass)
  console.log(JSON.stringify({ results, failCount: fail.length }, null, 2))
  console.log(fail.length === 0 ? 'ALL PASS' : `FAIL x${fail.length}`)
  process.exit(fail.length === 0 ? 0 : 1)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

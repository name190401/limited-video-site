// カバー方式の3状態検証: 開始直後(カバー) / 定常再生(映像) / 一時停止(カバー)。
const { chromium } = require('playwright')
const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = 'http://localhost:3100'

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'qualia2026' }) })
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(1000)

  // §03 先頭動画をクリック
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('オープニング'))
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  })
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('オープニング'))
    const sec = h.closest('section') || h.parentElement
    const btn = [...sec.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('全画面で再生'))
    btn && btn.click()
  })

  await page.waitForSelector('[role="dialog"] iframe', { timeout: 20000 }).catch(() => {})

  // ① 開始直後（カバーで YouTube タイトルを隠す想定）
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/qualia-player-1-initial.jpeg`, type: 'jpeg', quality: 85 })

  // ② 定常再生（reveal 後。映像が見え YouTube chrome は出ない想定）
  await page.waitForTimeout(6000)
  const st2 = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    const labels = [...dlg.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))
    return { playingLabel: labels.includes('一時停止') }
  })
  await page.screenshot({ path: `${OUT}/qualia-player-2-playing.jpeg`, type: 'jpeg', quality: 85 })

  // ③ 一時停止（カバーで YouTube の一時停止chromeを隠す想定）
  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    // コントロールバーの一時停止ボタン（bottom bar 内）を押す
    const bar = dlg.querySelector('div[class*="bottom-0"]')
    const pauseBtn = bar && [...bar.querySelectorAll('button')].find((b) => /一時停止|再生/.test(b.getAttribute('aria-label') || ''))
    pauseBtn && pauseBtn.click()
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/qualia-player-3-paused.jpeg`, type: 'jpeg', quality: 85 })

  console.log(JSON.stringify({ revealedPlaying: st2.playingLabel, shots: ['1-initial', '2-playing', '3-paused'] }, null, 2))
  await browser.close()
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

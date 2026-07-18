// §02 講師紹介の検証スクショ（MCPの5s制限回避＝headless Chrome 直駆動）。
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/shoot-sec02.cjs <width>
// Layer1 を fetch ログインしてから / の §02 を数枚キャプチャ。
const { chromium } = require('playwright')
const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'

;(async () => {
  const width = parseInt(process.argv[2] || '375', 10)
  const tag = process.argv[3] || String(width)
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const ctx = await browser.newContext({ viewport: { width, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  await page.goto('http://localhost:3100/enter', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'qualia2026' }),
    })
  })
  await page.goto('http://localhost:3100/', { waitUntil: 'networkidle', timeout: 60000 })

  // §02 先頭へ
  const secTop = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('講師紹介'))
    const sec = h.closest('section') || h.parentElement
    const top = window.scrollY + sec.getBoundingClientRect().top - 8
    window.scrollTo({ top, behavior: 'instant' })
    return top
  })
  await page.waitForTimeout(1200)

  // 3枚: 先頭(主役＋カード) → +840 → +840
  for (let n = 1; n <= 3; n++) {
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/qualia-v2-${tag}-${n}.jpeg`, type: 'jpeg', quality: 82 })
    await page.evaluate(() => window.scrollBy({ top: 840, behavior: 'instant' }))
  }

  await browser.close()
  console.log('done', tag)
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })

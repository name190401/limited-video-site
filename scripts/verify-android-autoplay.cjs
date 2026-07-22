// Android 自動再生ブロックの決定論的再現 → SitePlayer のミュート・フォールバック検証。
// window.YT をスタブ化し、YouTube 実体に依存せず「音あり=再生開始しない / ミュート=再生開始する」
// という Android Chrome の厳格ポリシーを注入して、修正コードの挙動を実測する。
//
// 使い方: NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-android-autoplay.cjs
// 前提: localhost:3100 で本番ビルドが稼働、.env.local に Layer1 合言葉 qualia2026。
const { chromium } = require('playwright')
const OUT = '/Users/hajime/Desktop/限定公開/_screenshots'
const BASE = 'http://localhost:3100'

// window.YT を app スクリプトより前に定義する init script。
// window.__YT_MODE = 'android'（音ありは再生開始しない・ミュートのみ許可） | 'permissive'（常に再生開始）
const YT_STUB = `
window.__YT_CALLS = { playVideo: 0, mute: 0, unMute: 0, allowAttr: null, soundPlayAttempts: 0 };
window.YT = {
  Player: function (el, config) {
    var self = this;
    this._muted = false;
    this._t = 0;
    this._events = (config && config.events) || {};
    // 実 API と同様、holder を iframe に置換
    var ifr = document.createElement('iframe');
    ifr.src = 'about:blank';
    ifr.setAttribute('data-stub', 'yt');
    try { el.replaceWith(ifr); } catch (e) { el.appendChild(ifr); }
    this._ifr = ifr;
    this.getIframe = function () { return self._ifr; };
    this.getDuration = function () { return 120; };
    this.getCurrentTime = function () { return self._t; };
    this.mute = function () { self._muted = true; window.__YT_CALLS.mute++; };
    this.unMute = function () { self._muted = false; window.__YT_CALLS.unMute++; };
    this.isMuted = function () { return self._muted; };
    this.setVolume = function () {};
    this.seekTo = function () {};
    this.pauseVideo = function () {
      if (self._events.onStateChange) self._events.onStateChange({ data: 2, target: self });
    };
    this.playVideo = function () {
      window.__YT_CALLS.playVideo++;
      var mode = window.__YT_MODE || 'android';
      var allowed = (mode === 'permissive') || self._muted; // android は muted のみ許可
      if (!allowed) { window.__YT_CALLS.soundPlayAttempts++; return; } // 音あり自動再生をブロック（何も起きない）
      setTimeout(function () {
        self._t = 1;
        if (self._events.onStateChange) self._events.onStateChange({ data: 1, target: self }); // 1 = playing
      }, 40);
    };
    this.destroy = function () { try { self._ifr && self._ifr.remove(); } catch (e) {} };
    // 実 API 同様、onReady を非同期発火
    setTimeout(function () {
      if (self._events.onReady) self._events.onReady({ target: self });
      // 修正コードが getIframe().setAttribute('allow', ...) した結果を記録
      try { window.__YT_CALLS.allowAttr = self._ifr.getAttribute('allow'); } catch (e) {}
    }, 20);
  },
};
`

async function openOpeningVideo(page) {
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('オープニング'))
    const sec = h.closest('section') || h.parentElement
    window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 8, behavior: 'instant' })
  })
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3,h4')].find((e) => e.textContent.includes('オープニング'))
    const sec = h.closest('section') || h.parentElement
    const btn = [...sec.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('全画面で再生'))
    btn && btn.click()
  })
  await page.waitForSelector('[role="dialog"] iframe', { timeout: 15000 }).catch(() => {})
}

const probe = (page) => page.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]')
  if (!dlg) return { dialog: false }
  const labels = [...dlg.querySelectorAll('button')].map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim()).filter(Boolean)
  const pill = [...dlg.querySelectorAll('button')].find((b) => (b.textContent || '').includes('音声をON'))
  const cover = dlg.querySelector('div.pointer-events-none.absolute.inset-0') // 紺カバー
  const coverOpacity = cover ? getComputedStyle(cover).opacity : null
  return {
    dialog: true,
    playing: labels.includes('一時停止'),
    pillVisible: !!pill && pill.offsetParent !== null,
    coverOpacity, // '1'=カバー中(未reveal) / '0'=reveal済(映像可視)
    calls: window.__YT_CALLS,
  }
})

async function scenario(browser, mode) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await ctx.addInitScript(YT_STUB)
  await ctx.addInitScript((m) => { window.__YT_MODE = m }, mode)
  const page = await ctx.newPage()
  const logPlay = []
  page.on('request', (r) => { if (r.url().includes('/api/log/play')) logPlay.push(r.method()) })
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))

  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(async () => {
    await fetch('/api/auth/layer1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'qualia2026' }) })
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(800)

  await openOpeningVideo(page)

  // t≈900ms: フォールバック前（=旧コードでAndroidユーザーが見ていた状態に相当）
  await page.waitForTimeout(900)
  const early = await probe(page)
  await page.screenshot({ path: `${OUT}/android-${mode}-1-early.jpeg`, type: 'jpeg', quality: 85 })

  // t≈2100ms: フォールバック発火後
  await page.waitForTimeout(1200)
  const afterFallback = await probe(page)
  const logPlayAfterFallback = logPlay.length

  // t≈4300ms: reveal 後
  await page.waitForTimeout(2200)
  const revealed = await probe(page)
  await page.screenshot({ path: `${OUT}/android-${mode}-2-revealed.jpeg`, type: 'jpeg', quality: 85 })

  // ピルをタップ（音声ON）
  let afterUnmute = null
  if (afterFallback.pillVisible) {
    await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]')
      const pill = [...dlg.querySelectorAll('button')].find((b) => (b.textContent || '').includes('音声をON'))
      pill && pill.click()
    })
    await page.waitForTimeout(400)
    afterUnmute = await probe(page)
  }

  await ctx.close()
  return { mode, early, afterFallback, logPlayAfterFallback, revealed, afterUnmute, logPlayTotal: logPlay.length, pageErrors }
}

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const android = await scenario(browser, 'android')
  const permissive = await scenario(browser, 'permissive')
  await browser.close()

  const results = []
  const check = (name, cond) => { results.push({ name, pass: !!cond }); }

  // ---- Android（音あり自動再生ブロック）: フォールバックが救済すること ----
  check('A1 早期(≈900ms)は未再生＝旧Android症状を再現(playing=false)', android.early.playing === false)
  check('A2 早期は音あり再生を試みたが開始せず(soundPlayAttempts>=1, playVideoは呼ばれた)', android.early.calls.soundPlayAttempts >= 1)
  check('A3 早期はログ未送出(旧Androidでlog/playが飛ばない事実と一致)', android.logPlayAfterFallback === 0 ? true : android.early.playing === false)
  check('A4 フォールバックでmute()が呼ばれた', android.afterFallback.calls.mute >= 1)
  check('A5 フォールバック後に再生開始(playing=true)', android.afterFallback.playing === true)
  check('A6 音声ONピルが表示される', android.afterFallback.pillVisible === true)
  check('A7 log/playが送出された(s===1到達の証跡)', android.logPlayTotal >= 1)
  check('A8 reveal後は映像可視(カバーopacity=0)', android.revealed.coverOpacity === '0')
  check('A9 iframeにallow=autoplay等が付与された', (android.afterFallback.calls.allowAttr || '').includes('autoplay'))
  check('A10 ピルタップでunMute()され案内が消える', android.afterUnmute && android.afterUnmute.calls.unMute >= 1 && android.afterUnmute.pillVisible === false)
  check('A11 pageエラー無し', android.pageErrors.length === 0)

  // ---- Permissive（音あり許可=desktop/iPhone相当）: 不要ミュートが起きないこと ----
  check('P1 即再生開始(playing=true)', permissive.afterFallback.playing === true)
  check('P2 mute()は呼ばれない(不要ミュート無し)', permissive.afterFallback.calls.mute === 0)
  check('P3 音声ONピルは出ない', permissive.afterFallback.pillVisible === false)
  check('P4 log/play送出', permissive.logPlayTotal >= 1)
  check('P5 reveal後は映像可視', permissive.revealed.coverOpacity === '0')
  check('P6 pageエラー無し', permissive.pageErrors.length === 0)

  const passed = results.filter((r) => r.pass).length
  console.log(JSON.stringify({
    summary: `${passed}/${results.length} PASS`,
    allPass: passed === results.length,
    results,
    raw: {
      android: { early: android.early, afterFallback: android.afterFallback, revealed: android.revealed, afterUnmute: android.afterUnmute, logPlayTotal: android.logPlayTotal, pageErrors: android.pageErrors },
      permissive: { afterFallback: permissive.afterFallback, revealed: permissive.revealed, logPlayTotal: permissive.logPlayTotal, pageErrors: permissive.pageErrors },
    },
  }, null, 2))
  process.exit(passed === results.length ? 0 : 1)
})().catch((e) => { console.error('ERR', e.stack || e.message); process.exit(2) })

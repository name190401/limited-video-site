// Supabase 障害時の耐性検証。
// この変更の眼目は「DB が落ちていても会員は入れる」こと。DB が健全な状態では原理的に
// 観測できないため、サービスロールキーを不正値にした 2 つ目のインスタンスを自分で起動して測る。
//
// 使い方: node scripts/verify-db-outage.cjs
//   前提: 正常インスタンスが :3100 で起動していること（陽性対照に使う）
//   前提: :3102 が空いていること（先住プロセスがいると preflight で exit 2）
//   ビルド済み成果物を配るので、ソースを直したら先に npm run build すること。
const { spawn } = require('child_process')
const { todayCode, readEnv } = require('./_login.cjs')

const PORT = Number(process.env.OUTAGE_PORT || 3102)
const BASE = `http://localhost:${PORT}`
const HEALTHY = process.env.BASE || 'http://localhost:3100'
const BAD_KEY = 'invalid.service.role.key.for.outage.test'
const WRONG_CODE = 'ZZZZZZ'

function cookieHeader(setCookies, name) {
  const hit = setCookies.find((line) => line.startsWith(`${name}=`))
  return hit ? hit.split(';')[0] : ''
}

const results = []
const check = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })

async function post(base, password) {
  const response = await fetch(`${base}/api/auth/layer1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    redirect: 'manual',
  })
  const setCookies = response.headers.getSetCookie?.() ?? [response.headers.get('set-cookie') ?? '']
  return { status: response.status, setCookies }
}

async function waitForReady(base, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/enter`, { redirect: 'manual' })
      if (response.status === 200) return true
    } catch {
      // まだ起動中
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

;(async () => {
  const code = todayCode()

  // 陽性対照を先に取る。正常インスタンスでは同じ誤コードが 401（503 ではない）。
  // これを取らずに 503 を見ると、「503 は障害由来」ではなく「元から 503」を見誤る。
  if (!(await waitForReady(HEALTHY, 5000))) {
    console.error(`ERR 正常インスタンス ${HEALTHY} が起動していない（陽性対照が取れない）`)
    process.exit(2)
  }
  const healthyWrong = await post(HEALTHY, WRONG_CODE)
  check('陽性対照: 正常インスタンスで誤コード → 401', healthyWrong.status === 401, `status=${healthyWrong.status}`)

  // 管理 Cookie は「障害が起きる前に取っておいたもの」を模す。正常インスタンスで取得する。
  const healthyAdmin = await post(HEALTHY, readEnv('ADMIN_PASSWORD'))
  const adminCookie = cookieHeader(healthyAdmin.setCookies, 'qualia_admin')
  check('前提: 正常インスタンスで管理者ログイン → 200 かつ管理Cookieが付く',
    healthyAdmin.status === 200 && adminCookie !== '', `status=${healthyAdmin.status} cookie=${adminCookie !== ''}`)

  // 先住プロセスがいると waitForReady が true を返し、自分の子（EADDRINUSE で即死）ではなく
  // **前回の中断で残った古いビルド**を測ってしまう。緑が偽になるので、測らずに落とす。
  if (await waitForReady(BASE, 1000)) {
    console.error(`ERR ${BASE} を既に誰かが使用中。前回の中断で残ったインスタンスの可能性があります。`)
    console.error(`    lsof -nP -iTCP:${PORT} -sTCP:LISTEN で確認し、kill してから再実行してください。`)
    process.exit(2)
  }

  const child = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, SUPABASE_SERVICE_ROLE_KEY: BAD_KEY, ENABLE_ACCESS_LOGS: 'false' },
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  // 起動できなかったときに理由（EADDRINUSE か、鍵か、ビルド不在か）を出せるよう溜めておく。
  let childStderr = ''
  child.stderr.on('data', (chunk) => { childStderr += chunk.toString() })
  // Ctrl-C で抜けると子が PID 1 に再ペアレントされて :3102 を掴んだまま残り、
  // 次回以降の実行が偽の緑になる。中断経路でも必ず落とす。
  const stopChild = () => { try { child.kill('SIGTERM') } catch { /* すでに終了 */ } process.exit(130) }
  process.once('SIGINT', stopChild)
  process.once('SIGTERM', stopChild)

  try {
    if (!(await waitForReady(BASE, 60000))) {
      throw new Error(`障害シミュレーション用インスタンス ${BASE} が起動しない\n--- 子プロセスの stderr ---\n${childStderr.trim() || '(出力なし)'}`)
    }

    // 陰性対照: 障害が実際に起きていることの確認。管理者判定は DB を要求する（フェイルクローズ）
    // ので、キーが効いていなければここが 401 のままになり、以降の 200 に意味が無くなる。
    const wrong = await post(BASE, WRONG_CODE)
    check('陰性対照: 障害中に誤コード → 503（401 なら障害が再現できていない）', wrong.status === 503, `status=${wrong.status}`)

    const member = await post(BASE, code)
    check('障害中でも当日コードで会員ログイン → 200', member.status === 200, `status=${member.status}`)

    const home = await fetch(`${BASE}/`, {
      redirect: 'manual',
      headers: { cookie: cookieHeader(member.setCookies, 'qualia_site') },
    })
    check('障害中でも会員が / を閲覧できる → 200', home.status === 200, `status=${home.status}`)

    // 管理 Cookie は障害中には取れない（管理者判定がフェイルクローズで 503）。
    // 障害前に取得済みの管理 Cookie を持って来た管理者が 500 ではなく案内を見る、が要件。
    const admin = await fetch(`${BASE}/admin`, {
      redirect: 'manual',
      headers: { cookie: adminCookie },
    })
    const adminHtml = admin.status === 200 ? await admin.text() : ''
    const adminPanel = adminHtml.includes('管理画面を表示できません')
    check('障害中の /admin（取得済み管理Cookie）が 500 ではなく案内パネル → 200',
      admin.status === 200 && adminPanel, `status=${admin.status} panel=${adminPanel}`)
  } finally {
    child.kill('SIGTERM')
  }

  const failed = results.filter((result) => !result.pass)
  console.log(JSON.stringify({ results, failCount: failed.length }, null, 2))
  process.exit(failed.length ? 1 : 0)
})().catch((error) => { console.error('ERR', error.stack || error.message); process.exit(2) })

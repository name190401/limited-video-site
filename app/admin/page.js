import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, readAdminPayload } from '@/lib/auth/admin'
import { ADMIN_PV_KEY, isVersionCurrent, readPasswordVersion } from '@/lib/auth/session-version'
import { getPasswordsForDays } from '@/lib/password'
import {
  SettingsUnavailableError,
  getAdminPassword,
  getSettingRow,
  getSitePassword,
} from '@/lib/settings'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { getLoginEvents, getPlayStats, logsEnabled } from '@/lib/logs'

// 日付・日替わりコードは毎リクエスト最新（キャッシュしない）。
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'QUALIA 管理画面',
  robots: { index: false, follow: false },
}

function SettingsUnavailablePanel() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 px-5 py-8 font-sansjp">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-gold-500/25 bg-navy-800/40 p-6">
          <h1 className="font-serifjp text-[18px] text-navy-100">管理画面を表示できません</h1>
          <p className="mt-4 break-keep text-[13px] leading-relaxed text-navy-100">
            データベースに接続できないため、管理画面のデータを表示できません。復旧後に再読み込みしてください。
          </p>
          <p className="mt-3 break-keep text-[12px] leading-relaxed text-navy-300">
            会員サイトの閲覧は継続できます。
          </p>
          <a
            href="/admin"
            className="mt-6 inline-block rounded-lg border border-gold-400/30 px-4 py-2 text-[13px] text-navy-100 transition-colors hover:border-gold-400/60 hover:text-white"
          >
            再読み込み
          </a>
        </div>
      </div>
    </main>
  )
}

/**
 * 管理画面（/admin）。ログイン入口は /enter に一本化したため、ここは単独ログインを持たない。
 * Admin Cookie 未所持なら /enter へ送る（統一ログインで管理者PWを入れると Admin Cookie が付く）。
 * 日替わりコードは PASSWORD_SECRET_KEY ＋ JST日付から決定的に算出（DB不要）。
 */
export default async function AdminPage() {
  const token = cookies().get(ADMIN_COOKIE)?.value
  const payload = await readAdminPayload(token)

  if (!payload) {
    redirect('/enter')
  }

  const currentVersion = await readPasswordVersion(ADMIN_PV_KEY)
  if (!isVersionCurrent(payload, currentVersion)) {
    redirect('/enter')
  }

  // 今日＋今後6日（計7日）の Layer2 日替わりコード（グループ0）。
  const days = getPasswordsForDays(7, 1).map((d) => ({
    date: d.date,
    code: d.groups[0].password,
  }))
  let dashboardData
  try {
    dashboardData = await Promise.all([
      getSitePassword(),
      getAdminPassword(),
      getSettingRow('site_password'),
      getSettingRow('admin_password'),
      getLoginEvents(50),
      getPlayStats(),
    ])
  } catch (err) {
    if (err instanceof SettingsUnavailableError || err?.name === 'SettingsUnavailableError') {
      return <SettingsUnavailablePanel />
    }
    throw err
  }
  const [sitePassword, adminPassword, sitePasswordRow, adminPasswordRow, loginEvents, playStats] =
    dashboardData

  return (
    <AdminDashboard
      days={days}
      sitePassword={sitePassword}
      adminPassword={adminPassword}
      sitePasswordUpdatedAt={sitePasswordRow?.updated_at ?? null}
      adminPasswordUpdatedAt={adminPasswordRow?.updated_at ?? null}
      loginEvents={loginEvents}
      playStats={playStats}
      logsEnabled={logsEnabled()}
    />
  )
}

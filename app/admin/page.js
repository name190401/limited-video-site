import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminCookieValue } from '@/lib/auth/admin'
import { getPasswordsForDays } from '@/lib/password'
import { getSitePassword } from '@/lib/settings'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'

// 日付・日替わりコードは毎リクエスト最新（キャッシュしない）。
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'QUALIA 管理画面',
  robots: { index: false, follow: false },
}

/**
 * 管理画面（/admin）。middleware で Layer1 免除 → ここで ADMIN_PASSWORD ゲート。
 * 未ログイン: ログインフォーム。ログイン済: 日替わりパスコード一覧＋会員合言葉。
 * 日替わりコードは PASSWORD_SECRET_KEY ＋ JST日付から決定的に算出（DB不要）。
 */
export default async function AdminPage() {
  const token = cookies().get(ADMIN_COOKIE)?.value
  const authed = await verifyAdminCookieValue(token)

  if (!authed) {
    return <AdminLogin />
  }

  // 今日＋今後6日（計7日）の Layer2 日替わりコード（グループ0）。
  const days = getPasswordsForDays(7, 1).map((d) => ({
    date: d.date,
    code: d.groups[0].password,
  }))
  const sitePassword = await getSitePassword()

  return <AdminDashboard days={days} sitePassword={sitePassword} />
}

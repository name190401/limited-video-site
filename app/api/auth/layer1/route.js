import { NextResponse } from 'next/server';
import { verifyLayer1Password, verifyAdminPassword } from '@/lib/auth/server';
import { issueLayer1CookieValue, layer1CookieOptions, LAYER1_COOKIE } from '@/lib/auth/layer1';
import { issueAdminCookieValue, adminCookieOptions, ADMIN_COOKIE } from '@/lib/auth/admin';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import { getJstDateString } from '@/lib/date';
import { logLogin } from '@/lib/logs';
import { SettingsUnavailableError, getPasswordVersion } from '@/lib/settings';
import { ADMIN_PV_KEY, SITE_PV_KEY } from '@/lib/auth/session-version';

export const runtime = 'nodejs';

/**
 * 統一ログイン（入口は /enter の1か所）。
 * - 会員の合言葉(SITE_PASSWORD) → Layer1 Cookie のみ（会員サイトへ）。
 * - 管理者パスワード(ADMIN_PASSWORD) → Layer1 ＋ Admin Cookie（会員サイト＋メニューに管理者ページ）。
 *   管理者も会員サイトに入れるよう Layer1 を必ず併せて付与する。
 * レート制限（20回/15分→429）含む配線は handlePasswordAuth と同型（dual-role 用に個別実装）。
 */
export async function POST(request) {
  try {
    const ip = clientIp(request);
    const gate = await checkAndIncrement({
      scope: 'layer1',
      ip,
      jstDate: getJstDateString(),
      max: 20,
      windowMin: 15,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        { success: false, error: 'too_many_attempts', lockedUntil: gate.lockedUntil },
        { status: 429 }
      );
    }

    const { password } = await request.json().catch(() => ({}));
    // 管理者を先に判定（万一 SITE と ADMIN が同値でも管理者を優先）。
    const isAdmin = await verifyAdminPassword(password);
    const isMember = isAdmin ? false : await verifyLayer1Password(password);

    if (!isAdmin && !isMember) {
      await gate.registerFailure();
      return NextResponse.json({ success: false, error: 'invalid' }, { status: 401 });
    }

    await gate.registerSuccess();
    await logLogin({
      kind: isAdmin ? 'admin' : 'member',
      ip,
      ua: request.headers.get('user-agent') || null,
    });
    const res = NextResponse.json({ success: true, role: isAdmin ? 'admin' : 'member' });
    // 発行する pv は必ずフェイルクローズで読む。照合用の readPasswordVersion は読めないと
    // 0 を返すため、それを載せた Cookie は現行世代が 1 以上のとき即座に弾かれてしまう
    // （ログインは 200 なのに次のリクエストで /enter へ戻される）。読めなければ 503。
    const [sitePv, adminPv] = await Promise.all([
      getPasswordVersion(SITE_PV_KEY),
      isAdmin ? getPasswordVersion(ADMIN_PV_KEY) : Promise.resolve(0),
    ]);
    res.cookies.set(LAYER1_COOKIE, await issueLayer1CookieValue(sitePv), layer1CookieOptions());
    if (isAdmin) {
      res.cookies.set(ADMIN_COOKIE, await issueAdminCookieValue(adminPv), adminCookieOptions());
    }
    return res;
  } catch (err) {
    if (err instanceof SettingsUnavailableError || err?.name === 'SettingsUnavailableError') {
      return NextResponse.json(
        { success: false, error: 'service_unavailable' },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

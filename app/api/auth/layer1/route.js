import { NextResponse } from 'next/server';
import { verifyLayer1Password, verifyAdminPassword } from '@/lib/auth/server';
import { issueLayer1CookieValue, layer1CookieOptions, LAYER1_COOKIE } from '@/lib/auth/layer1';
import { issueAdminCookieValue, adminCookieOptions, ADMIN_COOKIE } from '@/lib/auth/admin';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import { getJstDateString } from '@/lib/date';

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
    const res = NextResponse.json({ success: true, role: isAdmin ? 'admin' : 'member' });
    res.cookies.set(LAYER1_COOKIE, await issueLayer1CookieValue(), layer1CookieOptions());
    if (isAdmin) {
      res.cookies.set(ADMIN_COOKIE, await issueAdminCookieValue(), adminCookieOptions());
    }
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

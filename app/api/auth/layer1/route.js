import { NextResponse } from 'next/server';
import { verifyLayer1Password, verifyAdminPassword } from '@/lib/auth/server';
import { issueLayer1CookieValue, layer1CookieOptions, LAYER1_COOKIE } from '@/lib/auth/layer1';
import {
  ADMIN_COOKIE,
  ADMIN_PV_KEY,
  adminCookieOptions,
  issueAdminCookieValue,
} from '@/lib/auth/admin';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import { getJstDateString } from '@/lib/date';
import { logLogin } from '@/lib/logs';
import { SettingsUnavailableError, getPasswordVersion } from '@/lib/settings';

export const runtime = 'nodejs';

/**
 * 統一ログイン（入口は /enter の1か所）。
 * - 会員の日替わり 6 桁コード（DB 非依存）→ Layer1 Cookie のみ（会員サイトへ）。
 * - 管理者パスワード(ADMIN_PASSWORD) → Layer1 ＋ Admin Cookie（会員サイト＋メニューに管理者ページ）。
 *   管理者も会員サイトに入れるよう Layer1 を必ず併せて付与する。
 * レート制限は 50回/15分→429。DB 障害時はフェイルオープン（lib/ratelimit.js）。
 */
export async function POST(request) {
  try {
    const ip = clientIp(request);
    const gate = await checkAndIncrement({
      scope: 'layer1',
      ip,
      jstDate: getJstDateString(),
      // 携帯キャリアの CGNAT では多数の会員が同一 IP になりうる。6桁コードの空間は
      // 32^6 ≒ 10.7億通りなので、50回/15分でも総当たりを防ぎつつ他会員の巻き添えを抑えられる。
      max: 50,
      windowMin: 15,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        { success: false, error: 'too_many_attempts', lockedUntil: gate.lockedUntil },
        { status: 429 }
      );
    }

    const { password } = await request.json().catch(() => ({}));
    // 会員コードは 6 文字固定。管理者パスワードは /api/admin/password が 8〜64 文字を
    // 強制するので衝突しない（ただし ENV ブートストラップ値は未検査なので運用で守る）。
    // DB 非依存の会員判定を先にして、DB 障害時も会員を通す。
    if (await verifyLayer1Password(password)) {
      await gate.registerSuccess();
      await logLogin({
        kind: 'member',
        ip,
        ua: request.headers.get('user-agent') || null,
      });
      const res = NextResponse.json({ success: true, role: 'member' });
      res.cookies.set(LAYER1_COOKIE, await issueLayer1CookieValue(), layer1CookieOptions());
      return res;
    }

    const isAdmin = await verifyAdminPassword(password);
    if (!isAdmin) {
      await gate.registerFailure();
      return NextResponse.json({ success: false, error: 'invalid' }, { status: 401 });
    }
    await gate.registerSuccess();
    await logLogin({
      kind: 'admin',
      ip,
      ua: request.headers.get('user-agent') || null,
    });
    const res = NextResponse.json({ success: true, role: 'admin' });
    // Admin Cookie に載せる pv は必ずフェイルクローズで読む。読めなければ 503。
    const adminPv = await getPasswordVersion(ADMIN_PV_KEY);
    res.cookies.set(LAYER1_COOKIE, await issueLayer1CookieValue(), layer1CookieOptions());
    res.cookies.set(ADMIN_COOKIE, await issueAdminCookieValue(adminPv), adminCookieOptions());
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

import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_PV_KEY,
  adminCookieOptions,
  issueAdminCookieValue,
  isVersionCurrent,
  readAdminPayload,
} from '@/lib/auth/admin';
import { verifyAdminPassword } from '@/lib/auth/server';
import { getJstDateString } from '@/lib/date';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import {
  SettingsUnavailableError,
  getAdminPassword,
  getPasswordVersion,
  setSettings,
} from '@/lib/settings';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const gate = await checkAndIncrement({
      scope: 'admin-password',
      ip: clientIp(request),
      jstDate: getJstDateString(),
      max: 10,
      windowMin: 15,
    });
    if (!gate.allowed) {
      return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const payload = await readAdminPayload(token);
    if (!payload) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const adminVersion = await getPasswordVersion(ADMIN_PV_KEY);
    if (!isVersionCurrent(payload, adminVersion)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { current, next, confirm } = body;

    if (!(await verifyAdminPassword(current))) {
      await gate.registerFailure();
      return NextResponse.json({ error: 'invalid_current' }, { status: 401 });
    }

    // 型チェックを先に置く（未入力だと next === confirm === undefined が成立し、
    // 後段の判定に落ちて実態と違うエラー名を返してしまうため）。
    if (typeof next !== 'string' || typeof confirm !== 'string') {
      return NextResponse.json({ error: 'missing' }, { status: 400 });
    }
    if (next !== confirm) {
      return NextResponse.json({ error: 'mismatch' }, { status: 400 });
    }
    if (next.trim() !== next) {
      return NextResponse.json({ error: 'whitespace' }, { status: 400 });
    }
    // 会員の日替わりコードは固定 6 文字で会員判定が先に走る。8 文字以上を強制して
    // 管理者パスワードとの衝突を構造的に防ぐため、この下限は緩めない。
    if (next.length < 8 || next.length > 64) {
      return NextResponse.json({ error: 'length' }, { status: 400 });
    }
    if (!/^[\x21-\x7e]+$/.test(next)) {
      return NextResponse.json({ error: 'charset' }, { status: 400 });
    }

    const currentPassword = await getAdminPassword();
    if (next === currentPassword) {
      return NextResponse.json({ error: 'same_as_current' }, { status: 400 });
    }

    await gate.registerSuccess();

    // DB エラーで例外になるフェイルクローズの読み取りから世代を進める。
    const currentVersion = await getPasswordVersion(ADMIN_PV_KEY);
    const newVersion = currentVersion + 1;
    await setSettings([
      ['admin_password', next],
      [ADMIN_PV_KEY, String(newVersion)],
    ]);

    // 書き込み後に読み直さない。ここで読むと、変更は成立しているのに読み取り失敗で
    // 503 を返す窓ができる（画面の「最終変更」は /admin の再描画時に取り直される）。
    const response = NextResponse.json({ success: true });
    response.cookies.set(
      ADMIN_COOKIE,
      await issueAdminCookieValue(newVersion),
      adminCookieOptions()
    );
    return response;
  } catch (err) {
    if (err instanceof SettingsUnavailableError || err?.name === 'SettingsUnavailableError') {
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}

export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;

import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/password';
import { issuePlanToken, planCookieOptions, PLAN_COOKIE } from '@/lib/auth/layer2';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import { getJstDateString } from '@/lib/date';

export const runtime = 'nodejs';

/**
 * Layer2 解除（07 プランの合言葉）。
 * レート制限（scope=layer2, 10回/15分→429）→ 当日日替わりパス照合 →
 * 成功で qualia_plan httpOnly トークン Cookie を発行（JST 24:00 失効）。
 *
 * UI 層は早期ロックアウトしないが、サーバ層は 429 を必ず維持（layer1 と同方針）。
 */
export async function POST(request) {
  try {
    const ip = clientIp(request);
    const gate = await checkAndIncrement({
      scope: 'layer2',
      ip,
      jstDate: getJstDateString(),
      max: 10,
      windowMin: 15,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        { success: false, error: 'too_many_attempts', lockedUntil: gate.lockedUntil },
        { status: 429 }
      );
    }

    const { password } = await request.json().catch(() => ({}));
    if (!verifyPassword(password)) {
      await gate.registerFailure();
      return NextResponse.json({ success: false, error: 'invalid' }, { status: 401 });
    }

    await gate.registerSuccess();
    const res = NextResponse.json({ success: true });
    res.cookies.set(PLAN_COOKIE, await issuePlanToken(), planCookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

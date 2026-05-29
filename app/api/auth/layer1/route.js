import { NextResponse } from 'next/server';
import { verifyLayer1Password } from '@/lib/auth/server';
import { issueLayer1CookieValue, layer1CookieOptions, LAYER1_COOKIE } from '@/lib/auth/layer1';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import { getJstDateString } from '@/lib/date';

export const runtime = 'nodejs';

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
    const ok = await verifyLayer1Password(password);
    if (!ok) {
      await gate.registerFailure();
      return NextResponse.json({ success: false, error: 'invalid' }, { status: 401 });
    }

    await gate.registerSuccess();
    const res = NextResponse.json({ success: true });
    res.cookies.set(LAYER1_COOKIE, await issueLayer1CookieValue(), layer1CookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { checkAndIncrement, clientIp } from '../ratelimit';
import { getJstDateString } from '../date';
import { PLAN_COOKIE } from './layer2';
import { logLogin } from '../logs';

/**
 * パスワード認証 API の共通フロー（layer1 / layer2 plan 共通）。
 *
 * レート制限（scope 別 max/windowMin・超過は 429）→ password 照合 →
 * 失敗は 401＋registerFailure、成功は registerSuccess＋Cookie 発行。想定外例外は 500。
 * UI 層は早期ロックアウトしないが、サーバ層は 429 を必ず維持する方針。
 * （振る舞いは layer1/plan の元実装と同一。配線だけを共通化したもの）
 *
 * @param {Request} request
 * @param {object}  opts
 * @param {string}  opts.scope             レート制限スコープ（'layer1' | 'layer2'）
 * @param {number}  opts.max               ウィンドウ内の許容試行数
 * @param {number}  opts.windowMin         ウィンドウ長（分）
 * @param {(pw: string) => boolean | Promise<boolean>} opts.verify  パスワード照合
 * @param {string}  opts.cookieName        発行する Cookie 名
 * @param {() => string | Promise<string>} opts.issueCookieValue    Cookie 値の生成
 * @param {() => object} opts.cookieOptions Cookie オプションの生成
 */
export async function handlePasswordAuth(
  request,
  { scope, max, windowMin, verify, cookieName, issueCookieValue, cookieOptions }
) {
  try {
    const ip = clientIp(request);
    const gate = await checkAndIncrement({
      scope,
      ip,
      jstDate: getJstDateString(),
      max,
      windowMin,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        { success: false, error: 'too_many_attempts', lockedUntil: gate.lockedUntil },
        { status: 429 }
      );
    }

    const { password } = await request.json().catch(() => ({}));
    const ok = await verify(password);
    if (!ok) {
      await gate.registerFailure();
      return NextResponse.json({ success: false, error: 'invalid' }, { status: 401 });
    }

    await gate.registerSuccess();
    const res = NextResponse.json({ success: true });
    res.cookies.set(cookieName, await issueCookieValue(), cookieOptions());
    if (cookieName === PLAN_COOKIE) {
      await logLogin({ kind: 'unlock', ip, ua: request.headers.get('user-agent') || null });
    }
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

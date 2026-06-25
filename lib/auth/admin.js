/**
 * 管理画面 Cookie ヘルパー。Layer1 と同型（crypto-token + SESSION_SECRET）。
 * /admin は middleware で Layer1 を免除され、この Cookie で自前ゲートする。
 */
import { signToken, verifyToken } from '../crypto-token';

export const ADMIN_COOKIE = 'qualia_admin';
const MAX_AGE_SEC = 60 * 60 * 12; // 12時間（管理セッションは短め）

function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

/** 署名付き管理 Cookie の値を発行。 */
export async function issueAdminCookieValue() {
  return signToken(sessionSecret(), { v: 1, t: 'admin' });
}

/** 管理 Cookie の値が正当か検証。 */
export async function verifyAdminCookieValue(value) {
  if (!value) return false;
  const payload = await verifyToken(sessionSecret(), value);
  return !!payload && payload.t === 'admin';
}

/** Set-Cookie 用の属性。 */
export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  };
}

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
export async function issueAdminCookieValue(pv = 0) {
  return signToken(sessionSecret(), { v: 1, t: 'admin', pv });
}

/** 管理 Cookie を検証し、正当なら payload を返す。 */
export async function readAdminPayload(value) {
  if (!value) return null;
  const payload = await verifyToken(sessionSecret(), value);
  return payload?.t === 'admin' ? payload : null;
}

/**
 * 管理 Cookie の値が正当か検証（署名のみ・**パスワード世代は見ない**）。
 * 表示切替（会員ページの管理者向けリンク）のような、認可に使わない用途限定。
 * 認可する場所では readAdminPayload ＋ isVersionCurrent を使うこと。
 */
export async function verifyAdminCookieValue(value) {
  return !!(await readAdminPayload(value));
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

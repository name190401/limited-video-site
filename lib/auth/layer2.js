/**
 * Layer2 = プランセクションの当日アクセストークン。
 *
 * 日替わりロックパス照合に成功したら issuePlanToken() で署名付きトークンを発行し、
 * HttpOnly Cookie に載せる。トークンは JST 当日いっぱい有効（JST 24:00 で失効）。
 *
 * 同型（isomorphic）：crypto-token.js（Web Crypto）と lib/date.js のみに依存。
 * 'server-only' import を持たないが、実際の発行/検証は route handler から呼ぶ。
 */
import { signToken, verifyToken } from '../crypto-token';
import { getJstDateString, getJstMidnightExpiryEpoch, nowEpoch } from '../date';

export const PLAN_COOKIE = 'qualia_plan';

function planSecret() {
  const s = process.env.PLAN_TOKEN_SECRET;
  if (!s) throw new Error('PLAN_TOKEN_SECRET is not set');
  return s;
}

/**
 * 当日有効なプラントークンを発行。payload に JST日付と失効エポックを埋め込む。
 * @returns {Promise<string>}
 */
export async function issuePlanToken() {
  return signToken(planSecret(), {
    v: 1,
    t: 'plan',
    d: getJstDateString(),
    exp: getJstMidnightExpiryEpoch(),
  });
}

/**
 * プラントークンが有効か（署名・当日・未失効）を検証。
 * @param {string} value
 * @returns {Promise<boolean>}
 */
export async function verifyPlanToken(value) {
  if (!value) return false;
  const p = await verifyToken(planSecret(), value);
  if (!p || p.t !== 'plan') return false;
  // 署名が正しくても、日付が変わっていれば（前日トークン）無効
  if (p.d !== getJstDateString()) return false;
  if (typeof p.exp !== 'number' || p.exp <= nowEpoch()) return false;
  return true;
}

/** セッションCookie用の属性。有効上限はトークン payload の JST 24:00 失効で保証する。 */
export function planCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

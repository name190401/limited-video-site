/**
 * Layer1 Cookie ヘルパー（全体に入る共通パスワード通過後のセッション）。
 *
 * このモジュールは **同型（isomorphic）**：crypto-token.js（Web Crypto）と環境変数のみに
 * 依存し、'server-only' な import を持たない。これにより middleware（Edge ランタイム）から
 * 直接 import して Cookie 検証できる。
 *
 * パスワード照合（DB/settings 参照）は server 専用なので lib/auth/server.js に分離している。
 */
import { signToken, verifyToken } from '../crypto-token';
import { nowEpoch } from '../date';

export const LAYER1_COOKIE = 'qualia_site';

function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

/** 署名付き Layer1 Cookie の値を発行。 */
export async function issueLayer1CookieValue() {
  return signToken(sessionSecret(), { v: 1, t: 'l1', exp: nowEpoch() + 60 * 60 * 12 });
}

/** Layer1 Cookie の値が正当か検証（Edge/Node 両対応）。 */
export async function verifyLayer1CookieValue(value) {
  if (!value) return false;
  const payload = await verifyToken(sessionSecret(), value);
  return !!payload
    && payload.t === 'l1'
    && typeof payload.exp === 'number'
    && payload.exp > nowEpoch();
}

/** セッションCookie＋トークン12h失効＝毎回ログアウト方針の Set-Cookie 属性。 */
export function layer1CookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

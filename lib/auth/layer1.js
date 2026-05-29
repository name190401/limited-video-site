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

export const LAYER1_COOKIE = 'qualia_site';
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30日

function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

/** 署名付き Layer1 Cookie の値を発行。 */
export async function issueLayer1CookieValue() {
  return signToken(sessionSecret(), { v: 1, t: 'l1' });
}

/** Layer1 Cookie の値が正当か検証（Edge/Node 両対応）。 */
export async function verifyLayer1CookieValue(value) {
  if (!value) return false;
  const payload = await verifyToken(sessionSecret(), value);
  return !!payload && payload.t === 'l1';
}

/** Set-Cookie 用の属性。 */
export function layer1CookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  };
}

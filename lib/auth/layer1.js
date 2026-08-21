/**
 * セッション Cookie ヘルパー（入口で当日の合言葉を通過したあとのセッション）。
 *
 * このモジュールは **同型（isomorphic）**：crypto-token.js（Web Crypto）と環境変数のみに
 * 依存し、'server-only' な import を持たない。これにより middleware（Edge ランタイム）から
 * 直接 import して Cookie 検証できる。
 *
 * パスワード照合（Node.js crypto／DB settings）は server 専用なので
 * lib/auth/server.js に分離している。
 */
import { signToken, verifyToken } from '../crypto-token';
import { getJstDateString, getJstMidnightExpiryEpoch, nowEpoch } from '../date';

export const LAYER1_COOKIE = 'qualia_site';

function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

/** 署名付き Layer1 Cookie の値を発行。 */
export async function issueLayer1CookieValue() {
  // 日付と期限で別々に現在時刻を取ると JST 00:00 をまたいだ瞬間に食い違い、
  // 発行直後から無効な Cookie になりうるため、必ず同じ now から算出する。
  const now = new Date();
  return signToken(sessionSecret(), {
    v: 2,
    t: 'l1',
    d: getJstDateString(now),
    exp: getJstMidnightExpiryEpoch(now),
  });
}

/**
 * Layer1 Cookie を検証し、結果と失効理由を返す（Edge/Node 両対応）。
 */
export async function inspectLayer1Cookie(value) {
  if (!value) return { ok: false, reason: 'missing' };
  const payload = await verifyToken(sessionSecret(), value);
  // v:1 の現行 Cookie は日付を持たない。v:2 を必須にすることで、デプロイ反映と
  // 同時に全端末を意図どおりログアウトさせ、旧 Cookie を通さない。
  if (!payload || payload.v !== 2 || payload.t !== 'l1') {
    return { ok: false, reason: 'invalid' };
  }
  const validDate = typeof payload.d === 'string' && payload.d === getJstDateString();
  const validExpiry = typeof payload.exp === 'number' && payload.exp > nowEpoch();
  if (!validDate || !validExpiry) return { ok: false, reason: 'expired' };
  return { ok: true, payload };
}

/** Layer1 Cookie を検証し、正当なら payload、そうでなければ null を返す。 */
export async function readLayer1Payload(value) {
  const result = await inspectLayer1Cookie(value);
  return result.ok ? result.payload : null;
}

/** maxAge を持たないセッション Cookie。期限の正本は署名 payload。 */
export function layer1CookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

/**
 * 署名付きトークンの発行・検証（HMAC-SHA256）。
 *
 * Web Crypto（globalThis.crypto.subtle）のみを使うため、Edge ランタイム
 * （middleware.js）でも Node ランタイム（route handlers）でも同じコードが動く。
 * Node の 'crypto' を import しないこと（middleware で動かなくなる）。
 *
 * トークン形式:  base64url(JSON payload) + "." + base64url(HMAC署名)
 * 署名検証は crypto.subtle.verify（定数時間）で行う。
 */

function toBase64Url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const enc = new TextEncoder();

async function importKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * payload オブジェクトを署名付きトークンにする。
 * @param {string} secret HMAC鍵（環境変数）
 * @param {object} payload JSON可能なオブジェクト
 * @returns {Promise<string>}
 */
export async function signToken(secret, payload) {
  const body = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/**
 * 署名を検証し、正しければ payload を返す。改竄・不正形式は null。
 * 失効判定（exp 等）は呼び出し側の責務。
 * @param {string} secret
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export async function verifyToken(secret, token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const key = await importKey(secret);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sig),
      enc.encode(body)
    );
    if (!ok) return null;
    const json = new TextDecoder().decode(fromBase64Url(body));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

import '../server-only-guard';

/**
 * server 専用のパスワード照合（Node.js crypto や DB/settings を使うため Edge では使えない）。
 * route handlers からのみ import すること。middleware からは import しない。
 */
import { verifyPassword } from '../password';
import { getAdminPassword } from '../settings';

/** 定数時間に近い文字列比較（長さ差は即 false）。 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * 入口（サイト共通）パスワードの照合。
 * 入口の合言葉は PASSWORD_SECRET_KEY と JST 日付から算出する日替わり 6 桁コードで、
 * DB は参照しない。
 * @param {string} input
 * @returns {Promise<boolean>}
 */
export async function verifyLayer1Password(input) {
  if (typeof input !== 'string') return false;
  return verifyPassword(input.normalize('NFKC').trim(), 0);
}

/**
 * 管理画面パスワードの照合。
 * @param {string} input
 * @returns {Promise<boolean>}
 */
export async function verifyAdminPassword(input) {
  if (typeof input !== 'string' || input.length === 0) return false;
  return safeEqual(input, await getAdminPassword());
}

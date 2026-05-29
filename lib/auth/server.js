import '../server-only-guard';

/**
 * server 専用のパスワード照合（DB/settings を参照するため Edge では使えない）。
 * route handlers からのみ import すること。middleware からは import しない。
 */
import { getSitePassword, getAdminPassword } from '../settings';

/** 定数時間に近い文字列比較（長さ差は即 false）。 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Layer1（サイト共通）パスワードの照合。
 * @param {string} input
 * @returns {Promise<boolean>}
 */
export async function verifyLayer1Password(input) {
  if (typeof input !== 'string' || input.length === 0) return false;
  return safeEqual(input, await getSitePassword());
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

import crypto from 'crypto';
import { getJstDateString, getJstDateStrings } from './date';

/**
 * 日付ベースでパスワードを生成
 * シークレットキー + JST日付 + グループインデックス → SHA256ハッシュ → 6文字の英数字
 *
 * 日付は必ず JST 基準（lib/date.js）。UTC を使うと日付の切替がずれる。
 */
export function generateDailyPasswordForDate(secretKey, jstDateStr, groupIndex = 0) {
  const combined = secretKey + jstDateStr + String(groupIndex);

  // SHA256でハッシュ化
  const hash = crypto.createHash('sha256').update(combined).digest('hex');

  // 紛らわしい文字を除外した文字セット
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  // ハッシュから6文字のパスワードを生成
  let password = '';
  for (let i = 0; i < 6; i++) {
    const index = parseInt(hash.substr(i * 2, 2), 16) % chars.length;
    password += chars[index];
  }

  return password;
}

/**
 * 今日（JST）のパスワードを取得（グループ指定）
 */
export function getTodayPassword(groupIndex = 0) {
  const secretKey = process.env.PASSWORD_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PASSWORD_SECRET_KEY is not set');
  }
  return generateDailyPasswordForDate(secretKey, getJstDateString(), groupIndex);
}

/**
 * 指定日数分のパスワードを取得（全グループ対応）。JST基準。
 */
export function getPasswordsForDays(days = 7, groupCount = 1) {
  const secretKey = process.env.PASSWORD_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PASSWORD_SECRET_KEY is not set');
  }

  const passwords = [];
  for (const dateStr of getJstDateStrings(days)) {
    const groups = [];
    for (let g = 0; g < groupCount; g++) {
      groups.push({
        groupIndex: g,
        password: generateDailyPasswordForDate(secretKey, dateStr, g),
      });
    }
    passwords.push({ date: dateStr, groups });
  }

  return passwords;
}

/**
 * グループ別パスワードを検証（JST基準・定数時間比較）
 */
export function verifyPassword(inputPassword, groupIndex = 0) {
  if (typeof inputPassword !== 'string' || inputPassword.length === 0) return false;
  const todayPassword = getTodayPassword(groupIndex);
  const a = Buffer.from(inputPassword.toUpperCase());
  const b = Buffer.from(todayPassword);
  // 長さが違うと timingSafeEqual が例外を投げるため先に長さチェック
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

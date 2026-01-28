import crypto from 'crypto';

/**
 * 日付ベースでパスワードを生成
 * シークレットキー + 日付 → SHA256ハッシュ → 6文字の英数字
 */
export function generateDailyPassword(secretKey, date) {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const combined = secretKey + dateStr;
  
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
 * 今日のパスワードを取得
 */
export function getTodayPassword() {
  const secretKey = process.env.PASSWORD_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PASSWORD_SECRET_KEY is not set');
  }
  return generateDailyPassword(secretKey, new Date());
}

/**
 * 指定日数分のパスワードを取得
 */
export function getPasswordsForDays(days = 7) {
  const secretKey = process.env.PASSWORD_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PASSWORD_SECRET_KEY is not set');
  }
  
  const passwords = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    passwords.push({
      date: date.toISOString().split('T')[0],
      password: generateDailyPassword(secretKey, date),
    });
  }
  
  return passwords;
}

/**
 * パスワードを検証
 */
export function verifyPassword(inputPassword) {
  const todayPassword = getTodayPassword();
  return inputPassword.toUpperCase() === todayPassword;
}

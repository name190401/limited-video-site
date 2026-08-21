/**
 * JST（日本標準時 Asia/Tokyo, UTC+9・サマータイム無し）の単一の真実。
 *
 * 日替わりパスワード生成（lib/password.js）は必ずここを経由する。
 * 直接 `new Date().toISOString()`（UTC基準）を使うと、UTC 0:00〜JST 9:00 の間で
 * 日付がずれて「前日のパスが通る／当日のパスが弾かれる」事故になるため禁止。
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9 固定（DST 無し）

/**
 * 任意の時刻（省略時は現在）における JST の日付文字列 'YYYY-MM-DD' を返す。
 * @param {Date} [now]
 * @returns {string}
 */
export function getJstDateString(now = new Date()) {
  // UTC エポックに +9h して、その「UTC上の日付」を JST の暦日として読む
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 指定日数分の JST 日付文字列の配列（今日から +days-1 まで）。
 * 管理画面の「今後N日分のパスワード一覧」用。
 * @param {number} days
 * @param {Date} [now]
 * @returns {string[]}
 */
export function getJstDateStrings(days, now = new Date()) {
  const base = new Date(now.getTime() + JST_OFFSET_MS);
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const da = String(d.getUTCDate()).padStart(2, '0');
    out.push(`${y}-${mo}-${da}`);
  }
  return out;
}

/**
 * 次の JST 24:00（＝翌日 JST 0:00）の Unix エポック秒。
 * 当日いっぱいの有効期限計算に使う。
 * @param {Date} [now]
 * @returns {number} epoch seconds
 */
export function getJstMidnightExpiryEpoch(now = new Date()) {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  // JST 暦日の 0:00 を UTC エポックで求め、+1日して翌 0:00（＝当日の 24:00）にする
  const startOfJstDayUtcMs =
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) - JST_OFFSET_MS;
  const nextMidnightMs = startOfJstDayUtcMs + 24 * 60 * 60 * 1000;
  return Math.floor(nextMidnightMs / 1000);
}

/** 現在の Unix エポック秒。 */
export function nowEpoch() {
  return Math.floor(Date.now() / 1000);
}

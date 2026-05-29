import './server-only-guard';
import { getServiceClient } from './supabase/admin';

/**
 * Supabase バックエンドのレート制限。
 *
 * サーバーレス（Vercel）ではメモリ内カウンタが関数インスタンス間で共有されないため、
 * 必ず DB（`rate_limits` テーブル）で永続カウントする。
 * キーは `scope:ip:jstDate`（例 `layer2:203.0.113.5:2026-05-29`）。
 *
 * テーブル定義（002_rebuild_schema.sql）:
 *   key text primary key, attempts int, window_start timestamptz, locked_until timestamptz
 */

/** リクエストから接続元 IP を推定（Vercel は x-forwarded-for に実 IP）。 */
export function clientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * 失敗回数を判定し、必要なら登録ハンドラを返す。
 *
 * 使い方:
 *   const gate = await checkAndIncrement({scope,ip,jstDate,max,windowMin})
 *   if (!gate.allowed) return 429
 *   ...照合...
 *   失敗 → await gate.registerFailure()
 *   成功 → await gate.registerSuccess()
 *
 * @returns {Promise<{allowed:boolean, lockedUntil:string|null, registerFailure:Function, registerSuccess:Function}>}
 */
export async function checkAndIncrement({ scope, ip, jstDate, max, windowMin }) {
  const key = `${scope}:${ip}:${jstDate}`;
  const supabase = getServiceClient();
  const nowMs = Date.now();
  const windowMs = windowMin * 60 * 1000;

  const { data: row } = await supabase
    .from('rate_limits')
    .select('key, attempts, window_start, locked_until')
    .eq('key', key)
    .maybeSingle();

  // ロック中？
  if (row?.locked_until && new Date(row.locked_until).getTime() > nowMs) {
    return {
      allowed: false,
      lockedUntil: row.locked_until,
      registerFailure: async () => {},
      registerSuccess: async () => {},
    };
  }

  // ウィンドウが切れていればリセット扱い（cron 不要）
  const windowExpired =
    !row || !row.window_start || nowMs - new Date(row.window_start).getTime() > windowMs;
  const currentAttempts = windowExpired ? 0 : row.attempts || 0;

  return {
    allowed: true,
    lockedUntil: null,
    registerFailure: async () => {
      const attempts = currentAttempts + 1;
      const windowStart = windowExpired ? new Date(nowMs).toISOString() : row.window_start;
      const lockedUntil =
        attempts >= max ? new Date(nowMs + windowMs).toISOString() : null;
      await supabase
        .from('rate_limits')
        .upsert(
          { key, attempts, window_start: windowStart, locked_until: lockedUntil },
          { onConflict: 'key' }
        );
    },
    registerSuccess: async () => {
      // 成功したらカウンタを消す（次回フレッシュ）
      await supabase.from('rate_limits').delete().eq('key', key);
    },
  };
}

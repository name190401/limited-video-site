/**
 * ローカルモード判定。
 *
 * Supabase が未復旧/不在のとき、.env.local に `USE_LOCAL_CONTENT=true` を設定すると、
 * コンテンツ取得・レート制限・設定参照を DB ではなくローカルデータ/ENV で動かす。
 * Supabase を復旧したらこのフラグを外す（または false にする）だけで DB 取得に戻る。
 *
 * process.env のみ参照（supabase を import しない）ので server 専用ガード不要。
 */
export function isLocalMode() {
  return process.env.USE_LOCAL_CONTENT === 'true'
}

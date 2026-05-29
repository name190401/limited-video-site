import '../server-only-guard';
import { createClient } from '@supabase/supabase-js';

/**
 * service-role キーを使う **server 専用** Supabase クライアント。
 *
 * - RLS をバイパスして読み書きできる唯一の経路。保護コンテンツ（layer2 の youtube_id 等）は
 *   このクライアント経由でのみ取得し、anon キーでクライアントへは渡さない（先方原則②）。
 * - 'server-only' により Client Component から import するとビルドエラーになる。
 * - NEXT_PUBLIC_ には絶対に置かない（鍵がバンドルに乗る）。
 */
let _client = null;

export function getServiceClient() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service env vars are not set');
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

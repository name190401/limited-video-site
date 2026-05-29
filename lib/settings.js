import './server-only-guard';
import { getServiceClient } from './supabase/admin';

/**
 * 可変設定（サイト共通パスワード・管理パスワード）の取得・更新。
 *
 * DB の `settings` テーブルを優先し、未設定なら環境変数にフォールバックする。
 * 管理画面（設定タブ）から DB を更新すれば、再デプロイ無しで変更が反映される。
 */

async function getSetting(key) {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    return data?.value ?? null;
  } catch {
    // settings テーブル未作成等は ENV フォールバックに任せる
    return null;
  }
}

export async function setSetting(key, value) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}

/** サイト共通パスワード（Layer1）。DB → ENV の順。 */
export async function getSitePassword() {
  const db = await getSetting('site_password');
  if (db) return db;
  const env = process.env.SITE_PASSWORD;
  if (!env) throw new Error('SITE_PASSWORD is not set (DBにもENVにも無し)');
  return env;
}

/** 管理画面パスワード。DB → ENV の順。 */
export async function getAdminPassword() {
  const db = await getSetting('admin_password');
  if (db) return db;
  const env = process.env.ADMIN_PASSWORD;
  if (!env) throw new Error('ADMIN_PASSWORD is not set (DBにもENVにも無し)');
  return env;
}

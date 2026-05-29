import './server-only-guard';

/**
 * 可変設定（サイト共通パスワード等）の取得・更新。
 *
 * Phase 1: 環境変数（SITE_PASSWORD / ADMIN_PASSWORD）のみ。
 * Phase 2: DB の `settings` テーブルを優先し、未設定時に環境変数へフォールバックする
 *          実装へ差し替える（管理画面から変更可能にするため）。getSitePassword /
 *          getAdminPassword のシグネチャは据え置き、内部だけ DB 参照に変える。
 */

/**
 * サイト共通パスワード（Layer1）。
 * @returns {Promise<string>}
 */
export async function getSitePassword() {
  const env = process.env.SITE_PASSWORD;
  if (!env) throw new Error('SITE_PASSWORD is not set');
  return env;
}

/**
 * 管理画面パスワード。
 * @returns {Promise<string>}
 */
export async function getAdminPassword() {
  const env = process.env.ADMIN_PASSWORD;
  if (!env) throw new Error('ADMIN_PASSWORD is not set');
  return env;
}

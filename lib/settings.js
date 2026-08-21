import './server-only-guard';
import { getServiceClient } from './supabase/admin';

/**
 * 管理者パスワードと管理者パスワード世代の取得・更新。
 *
 * DB の `settings` テーブルを正本とし、行が無いときだけ環境変数にフォールバックする。
 * DB に到達できないときは環境変数へ落とさず例外にし、古いパスワードの復活を防ぐ。
 */

export class SettingsUnavailableError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = 'SettingsUnavailableError';
  }
}

/**
 * `settings` の1行を取得する。行が無ければ null。
 * **DB に到達できないときは null ではなく SettingsUnavailableError を投げる**
 * （null にすると呼び出し側が環境変数へフォールバックし、変更前の古い値が復活するため）。
 * @param {string} key
 * @returns {Promise<{value:string, updated_at:string}|null>}
 */
export async function getSettingRow(key) {
  let result;
  try {
    const supabase = getServiceClient();
    result = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', key)
      .maybeSingle();
  } catch (cause) {
    throw new SettingsUnavailableError('設定を取得できませんでした', cause);
  }

  const { data, error } = result;
  if (error) {
    throw new SettingsUnavailableError('設定を取得できませんでした', error);
  }
  return data ?? null;
}

async function getSetting(key) {
  const row = await getSettingRow(key);
  return row?.value ?? null;
}

/**
 * 複数の設定を 1 回の upsert（＝1 ステートメント）で書き込む。
 *
 * パスワードと世代番号は「片方だけ書き込まれた」状態を作らないよう必ずこれで同時に書く。
 * **1件だけ書く関数は意図的に置いていない**（パスワードを書いて世代を書き忘れると、
 * 変更したのに既存セッションが失効しないまま気づけない状態になるため）。
 * @param {Array<[string, string]>} entries
 */
export async function setSettings(entries) {
  const updatedAt = new Date().toISOString();
  const rows = entries.map(([key, value]) => ({ key, value, updated_at: updatedAt }));

  let result;
  try {
    const supabase = getServiceClient();
    result = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  } catch (cause) {
    throw new SettingsUnavailableError('設定を更新できませんでした', cause);
  }

  if (result.error) {
    throw new SettingsUnavailableError('設定を更新できませんでした', result.error);
  }
}

/**
 * パスワード世代番号を DB から**フェイルクローズ**で読む（Node ランタイム専用）。
 *
 * Cookie の発行・照合と世代を +1 する経路で使う。DB エラー時は例外を投げ、
 * 読み取り失敗を 0 とみなして世代を巻き戻すことがないようフェイルクローズにする。
 * @param {string} key
 * @returns {Promise<number>} 0 以上の整数（行が無ければ 0）
 */
export async function getPasswordVersion(key) {
  const parsed = Number((await getSettingRow(key))?.value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

/** 管理画面パスワード。DB → ENV の順。 */
export async function getAdminPassword() {
  const db = await getSetting('admin_password');
  if (db) return db;
  const env = process.env.ADMIN_PASSWORD;
  if (!env) throw new Error('ADMIN_PASSWORD is not set (DBにもENVにも無し)');
  return env;
}

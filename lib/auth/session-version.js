import '../server-only-guard';

/**
 * パスワード世代番号の**照合用**リーダ。
 *
 * middleware（Edge ランタイム）から使うため `@supabase/supabase-js` を import せず、
 * Supabase REST を fetch で叩く。service-role キーを使うのでクライアントへ混入しては
 * ならず、'../server-only-guard' で実行時に検知する（Edge では window が無いので素通し）。
 *
 * **Cookie を発行する経路・世代を +1 する経路では、ここではなく `lib/settings.js` の
 * `getPasswordVersion`（フェイルクローズ）を使うこと。** ここは読めなければ 0 に落ちる
 * ため、発行時に使うと「発行直後の Cookie が即失効する」事故になる。
 */

export const SITE_PV_KEY = 'site_password_version';
export const ADMIN_PV_KEY = 'admin_password_version';

const CACHE_TTL_MS = 30 * 1000;
const SOFT_CACHE_TTL_MS = 5 * 1000;
// middleware は matcher 配下の全リクエストで走るので、応答しない DB に引きずられて
// サイト全体が固まらないよう必ず打ち切る（タイムアウト無しで 240 秒無応答を実測）。
const FETCH_TIMEOUT_MS = 1500;
const versionCache = new Map();

/** AbortSignal.timeout が無いランタイム向けのフォールバック付きタイムアウト signal。 */
function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function cacheFallback(key, cached) {
  const value = cached?.value ?? 0;
  versionCache.set(key, { value, at: Date.now(), soft: true });
  return value;
}

/**
 * パスワード世代番号を Supabase REST から取得する（**照合用・フェイルオープン**）。
 *
 * パスワード照合側は DB 障害時にフェイルクローズする一方、セッション世代の確認は
 * フェイルオープンとする。この確認まで閉じると、Supabase 停止時に閲覧中の全会員が
 * 即時ログアウトするためであり、この非対称は意図的である。
 *
 * 「読めなければ通す」ので、**Cookie の発行値としては使えない**（キャッシュを持たない
 * isolate で読み取りに失敗すると 0 を返し、その 0 を pv に載せた Cookie は現行世代が
 * 1 以上のとき即座に弾かれる）。発行・更新は `lib/settings.js` の `getPasswordVersion`。
 */
export async function readPasswordVersion(key) {
  const cached = versionCache.get(key);
  // 障害時のフェイルオープン値も短時間だけ保持し、全リクエストで DB へ往復し続けるのを防ぐ。
  const cacheTtl = cached?.soft ? SOFT_CACHE_TTL_MS : CACHE_TTL_MS;
  if (cached && Date.now() - cached.at < cacheTtl) {
    return cached.value;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return cacheFallback(key, cached);

  try {
    const res = await fetch(
      `${url}/rest/v1/settings?select=value&key=eq.${encodeURIComponent(key)}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: 'no-store',
        signal: timeoutSignal(FETCH_TIMEOUT_MS),
      }
    );
    if (!res.ok) return cacheFallback(key, cached);

    const rows = await res.json();
    const parsed = Number(rows?.[0]?.value);
    const value = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
    versionCache.set(key, { value, at: Date.now(), soft: false });
    return value;
  } catch {
    return cacheFallback(key, cached);
  }
}

/** 指定した世代番号のキャッシュを破棄する。省略時はすべて破棄する。 */
export function invalidateVersionCache(key) {
  if (key === undefined) {
    versionCache.clear();
    return;
  }
  versionCache.delete(key);
}

export function isVersionCurrent(payload, currentVersion) {
  const payloadVersion = typeof payload?.pv === 'number' ? payload.pv : 0;
  // 古い isolate では現行世代が実際より小さく見えるため、=== だと発行直後の正しい
  // Cookie を誤って拒否する。>= なら古い Cookie の失効が最大 TTL 分遅れるだけで済む。
  return payloadVersion >= currentVersion;
}

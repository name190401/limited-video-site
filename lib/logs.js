import './server-only-guard';
import { getServiceClient } from './supabase/admin';

/** ログ機能は明示フラグと service-role 接続情報が揃った場合だけ有効。 */
export function logsEnabled() {
  return Boolean(
    process.env.ENABLE_ACCESS_LOGS === 'true' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function logLogin({ kind, ip, ua }) {
  if (!logsEnabled()) return;
  try {
    const { error } = await getServiceClient().from('login_events').insert({ kind, ip, ua });
    if (error) throw error;
  } catch (error) {
    console.error('Failed to write login event', error);
  }
}

export async function logPlay({ youtubeId, title, ip, ua }) {
  if (!logsEnabled()) return;
  try {
    const { error } = await getServiceClient().from('play_events').insert({
      youtube_id: youtubeId,
      title,
      ip,
      ua,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Failed to write play event', error);
  }
}

export async function getLoginEvents(limit = 50) {
  if (!logsEnabled()) return [];
  try {
    const { data, error } = await getServiceClient()
      .from('login_events')
      .select('id, ts, kind, ip, ua')
      .order('ts', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to read login events', error);
    return [];
  }
}

export async function getPlayStats() {
  if (!logsEnabled()) return [];
  try {
    const { data, error } = await getServiceClient()
      .from('play_events')
      .select('youtube_id, title, ts')
      .order('ts', { ascending: false })
      .limit(1000);
    if (error) throw error;

    const stats = new Map();
    for (const event of data || []) {
      const current = stats.get(event.youtube_id);
      if (current) {
        current.count += 1;
      } else {
        stats.set(event.youtube_id, {
          youtubeId: event.youtube_id,
          title: event.title,
          count: 1,
          lastPlayedAt: event.ts,
        });
      }
    }
    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Failed to read play events', error);
    return [];
  }
}

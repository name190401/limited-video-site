import './server-only-guard';
import { getServiceClient } from './supabase/admin';
import { isLocalMode } from './local-mode';
import { maskVideoForLayer1 } from './video';
import {
  localSections,
  localInstructors,
  localAllSectionVideos,
  localSectionVideos,
  localProtectedVideos,
  localFaqs,
} from './content-local';

/**
 * コンテンツ取得（すべて service-role 経由 = サーバー専用）。
 *
 * 重要原則: layer2 動画の youtube_id は、Layer2 トークン検証を通った
 * /api/plan/content からの getProtectedVideos() でしか返さない。
 * 通常のセクション取得 getSectionVideos() では layer2 行の youtube_id を必ず伏せる。
 */

export async function getSections() {
  if (isLocalMode()) return localSections();
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('sections')
    .select('key, title, body, sort_order, status')
    .order('sort_order');
  return data || [];
}

/**
 * セクションの動画一覧。layer2 行は youtube_id を伏せ、locked フラグを立てる。
 * （layer2 の実 ID は決してここから出さない）
 */
export async function getSectionVideos(sectionKey) {
  if (isLocalMode()) return localSectionVideos(sectionKey);
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('videos')
    .select('id, section_key, title, subtitle, youtube_id, protection, variant, audio_muted, status, sort_order')
    .eq('section_key', sectionKey)
    .order('sort_order');
  return (data || []).map(maskVideoForLayer1);
}

/** 全 layer1 動画をセクション別にまとめて返す（メンバーページ初期描画用）。 */
export async function getAllSectionVideos() {
  if (isLocalMode()) return localAllSectionVideos();
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('videos')
    .select('id, section_key, title, subtitle, youtube_id, protection, variant, audio_muted, status, sort_order')
    .order('section_key')
    .order('sort_order');
  const grouped = {};
  for (const v of data || []) {
    (grouped[v.section_key] ||= []).push(maskVideoForLayer1(v));
  }
  return grouped;
}

/**
 * layer2 動画の実 ID を全セクション横断で返す。
 * **必ず Layer2 トークン検証後（/api/plan/content）からのみ呼ぶこと。**
 */
export async function getProtectedVideos() {
  if (isLocalMode()) return localProtectedVideos();
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('videos')
    .select('id, section_key, title, subtitle, variant, audio_muted, youtube_id, status, sort_order')
    .eq('protection', 'layer2')
    .eq('status', 'published')
    .not('youtube_id', 'is', null)
    .order('section_key')
    .order('sort_order');
  // 公開済み & ID 設定済みのものだけ返す
  return (data || []).filter((v) => v.status === 'published' && v.youtube_id);
}

export async function getInstructors(type) {
  if (isLocalMode()) return localInstructors(type);
  const supabase = getServiceClient();
  let q = supabase
    .from('instructors')
    .select('id, name, type, region, age, profile, photo_url, attribute_tags, youtube_id, sort_order, status')
    .eq('is_active', true)
    .order('sort_order');
  if (type) q = q.eq('type', type);
  const { data } = await q;
  return data || [];
}

export async function getFaqs() {
  if (isLocalMode()) return localFaqs();
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('faqs')
    .select('id, question, answer, sort_order, status')
    .eq('status', 'published')
    .order('sort_order');
  return data || [];
}

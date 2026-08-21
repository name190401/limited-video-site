import './server-only-guard';
import { getServiceClient } from './supabase/admin';
import { isLocalMode } from './local-mode';
import {
  localSections,
  localInstructors,
  localAllSectionVideos,
  localSectionVideos,
  localFaqs,
} from './content-local';

/**
 * コンテンツ取得（すべて service-role 経由 = サーバー専用）。
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

/** セクションの動画一覧。 */
export async function getSectionVideos(sectionKey) {
  if (isLocalMode()) return localSectionVideos(sectionKey);
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('videos')
    .select('id, section_key, title, subtitle, youtube_id, variant, audio_muted, status, sort_order')
    .eq('section_key', sectionKey)
    .order('sort_order');
  return data || [];
}

/** 全 layer1 動画をセクション別にまとめて返す（メンバーページ初期描画用）。 */
export async function getAllSectionVideos() {
  if (isLocalMode()) return localAllSectionVideos();
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('videos')
    .select('id, section_key, title, subtitle, youtube_id, variant, audio_muted, status, sort_order')
    .order('section_key')
    .order('sort_order');
  const grouped = {};
  for (const v of data || []) {
    (grouped[v.section_key] ||= []).push(v);
  }
  return grouped;
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

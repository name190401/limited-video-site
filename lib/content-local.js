/**
 * ローカルフォールバック用コンテンツ（Supabase 不在時のオフライン表示用）。
 *
 * 正本は supabase/migrations/002_rebuild_schema.sql・003_seed_instructors.sql。
 * Supabase を復旧したら .env.local の USE_LOCAL_CONTENT を外せば DB 取得に戻る。
 * セキュリティ: layer2（プラン）の実 youtube_id はここに置かない（全て coming_soon）。
 */
import { maskVideoForLayer1 } from './video'

// ---- セクション（13） -----------------------------------------
export const LOCAL_SECTIONS = [
  { key: 'origin',       title: 'QUALIAの名前の由来',     sort_order: 1,  status: 'published',   body: null },
  { key: 'instructors',  title: '講師紹介',               sort_order: 2,  status: 'published',   body: null },
  { key: 'ear_opening',  title: '耳開け・導入',           sort_order: 3,  status: 'published',   body: null },
  { key: 'plan_intro',   title: 'プラン説明',             sort_order: 4,  status: 'published',   body: null },
  { key: 'closing',      title: 'クロージング',           sort_order: 5,  status: 'published',   body: null },
  { key: 'instagram',    title: 'Instagram',              sort_order: 6,  status: 'published',   body: null },
  { key: 'plan',         title: 'プラン',                 sort_order: 7,  status: 'coming_soon', body: null },
  { key: 'bonus',        title: 'ボーナス（インカム）',   sort_order: 8,  status: 'coming_soon', body: null },
  { key: 'products',     title: '製品',                   sort_order: 9,  status: 'coming_soon', body: null },
  { key: 'training',     title: 'トレーニング',           sort_order: 10, status: 'coming_soon', body: null },
  { key: 'registration', title: '登録の流れ',             sort_order: 11, status: 'coming_soon', body: null },
  { key: 'how_to_use',   title: 'QUALIAページの使い方',   sort_order: 12, status: 'coming_soon', body: null },
  { key: 'faq',          title: 'よくある質問',           sort_order: 13, status: 'published',   body: null },
]

// ---- 講師（石井諒 + 提供13名） --------------------------------
// 氏名はプロフィール文書準拠。写真は public/instructors/ のルート相対パス。
const lec = (id, name, sort_order, profile, photo_url, extra = {}) => ({
  id, name, type: 'lecturer', region: null, age: null, profile,
  photo_url, attribute_tags: [], youtube_id: null, sort_order,
  status: 'published', is_active: true, ...extra,
})
export const LOCAL_INSTRUCTORS = [
  lec(1, '石井諒', 1,
    '22歳からネットワークビジネスをSTART、31歳でQUALIAと出会い、最高タイトルを最年少・最速で獲得。',
    '/instructors/01-ishii-ryo.jpg',
    { region: '千葉県', age: 35, hero_photo_url: '/instructors/01-ishii-ryo-avatar.jpg' }),
  lec(2, '中村佳世', 2,
    '産後1ヶ月半でスタート！諦め癖のあった私がいつからでもチャレンジできることを体現しています。このビジネスの可能性を感じてください。',
    '/instructors/02-nakamura-kayo.jpg'),
  lec(3, '高橋剛輝', 3,
    '22歳からMLMスタート\n30歳でQUALIAビジネスと出会い\n2年で2500人チーム構築',
    '/instructors/03-takahashi-goki.jpg'),
  lec(4, '阿部美道', 4,
    '株式会社DCT代表取締役\n20代で不動産全国1位を達成\n29歳で独立し事業展開\n不動産・人材・コンサルで活動\n「人の役に立つ」が理念',
    '/instructors/04-abe-mimichi.jpg'),
  lec(5, '中矢真理', 5,
    '20年間専業主婦、\n前NBで8年間するが上手くいかず、フィールドをQUALIA変えたら9ヶ月で人生激変！',
    '/instructors/05-nakaya-mari.jpg'),
  lec(6, '丹治郁子', 6,
    'ヘルニアを機に権利収入へ。\n誰もが収入を得られる環境が整った石井諒チームに移籍。',
    '/instructors/06-tanji-ikuko.jpg'),
  lec(7, '宮地百絵', 7,
    'QUALIA参入から１ヶ月で離婚\n毎月大好きな旅行に\nシングルマザーでも自由を選べる毎日に！',
    '/instructors/07-miyaji-momoe.jpg'),
  lec(8, '西野将平', 8,
    '22歳からこの業界に携わり、想像以上の経験とライフスタイルを手にする事が出来ました！\n是非こちらのコンテンツでこのビジネスの可能性を見つけてください^ ^',
    '/instructors/08-nishino-shohei.jpg'),
  lec(9, '岡田由加里', 9,
    '育休中に"時間も収入も叶える働き方"を実現\n子供との時間も収入も諦めたくないママへ\n「普通のママでもできる」を発信中',
    '/instructors/09-okada-yukari.jpg'),
  lec(10, '久保田幸世', 10,
    '中卒シングルマザー、NBで13年間うまくいかず、QUALIAに手段を変えて人生大変化‼',
    '/instructors/10-kubota-sachiyo.jpg'),
  lec(11, '竹之内尚也', 11,
    '元お笑い芸人から看護師まで幅広い経験を経て見た目もライフスタイルも激変した鹿児島の歩くbefore＆after男！',
    '/instructors/11-takenouchi-naoya.jpg'),
  lec(12, '小林一貴', 12,
    '前社では8年やって最高月収8万\nQUALIAでは登録して3日で7万、4日で9万と前社の最高月収を4日で更新',
    '/instructors/12-kobayashi-kazuki.jpg'),
  lec(13, '伴隆', 13,
    '30歳からMLMスタート\n43歳でQUALIAビジネスと出会い\nスタート約半年で招待旅行を獲得',
    '/instructors/13-ban-takashi.jpg'),
  lec(14, '中村正人', 14,
    '24歳でMLMスタート\n43歳でQUALIAに移籍\n前社、QUALIA共に招待旅行獲得',
    '/instructors/14-nakamura-masato.jpg'),
  // ── クロージング担当（type='closer'・§05タブ専用。§02 lecturer とは別レコード）──
  lec(15, '中村佳世',   15, null, null, { type: 'closer' }),
  lec(16, '阿部美道',   16, null, null, { type: 'closer' }),
  lec(17, '久保田幸世', 17, null, null, { type: 'closer' }),
  lec(18, '竹之内尚也', 18, null, null, { type: 'closer' }),
]

// ---- 動画（training 9 / plan 2[layer2] / products 2） ----------
const vid = (id, section_key, title, sort_order, o = {}) => ({
  id, section_key, title, subtitle: o.subtitle ?? null, youtube_id: o.youtube_id ?? null,
  protection: o.protection ?? 'layer1', variant: o.variant ?? null,
  audio_muted: o.audio_muted ?? false, status: o.status ?? 'coming_soon', sort_order,
})
export const LOCAL_VIDEOS = [
  vid(1, 'training', 'FA',           1, { subtitle: 'かよさん' }),
  vid(2, 'training', 'BMT',          2, { subtitle: 'こうきくん' }),
  vid(3, 'training', 'ウーマン',     3, { subtitle: 'はるくん' }),
  vid(4, 'training', '経済セミナー', 4, { subtitle: 'みっくん' }),
  vid(5, 'training', 'ルーツ',       5, { subtitle: 'かずき' }),
  vid(6, 'training', '噛み砕き',     6, { subtitle: '尚也くん' }),
  vid(7, 'training', 'フレッシュ',   7, { subtitle: '正人さん' }),
  vid(8, 'training', 'MAPの書き方',  8, { subtitle: 'みっくん' }),
  vid(9, 'training', 'QUALIAパーク・共済（福利厚生）', 9, { subtitle: '担当未定' }),
  vid(10, 'plan', 'ショートプラン', 1, { protection: 'layer2', variant: 'short' }),
  vid(11, 'plan', 'ロングプラン',   2, { protection: 'layer2', variant: 'long' }),
  vid(12, 'products', '製品ショート', 1, { variant: 'short', audio_muted: true }),
  vid(13, 'products', '製品ロング',   2, { variant: 'long' }),
  // ── 事業説明ファネル動画（講師陣ファイル由来・全て layer1 / published）──
  // §03 耳開け・導入（導入）
  vid(14, 'ear_opening', '中村佳世',   1, { youtube_id: 'ySzQg8d3iQ4', status: 'published' }),
  vid(15, 'ear_opening', '阿部美道',   2, { youtube_id: 'GYp6q1XNDr4', status: 'published' }),
  vid(16, 'ear_opening', '中矢真理',   3, { youtube_id: '19RgaxonW5Q', status: 'published' }),
  vid(17, 'ear_opening', '丹治郁子',   4, { youtube_id: 'etWgf_7JA6I', status: 'published' }),
  vid(18, 'ear_opening', '宮地百絵',   5, { youtube_id: '9P9myBeBy2Q', status: 'published' }),
  vid(19, 'ear_opening', '岡田由加里', 6, { youtube_id: 'j0UfpCtr-n0', status: 'published' }),
  vid(20, 'ear_opening', '久保田幸世', 7, { youtube_id: 'VTDkDjt4rIk', status: 'published' }),
  // §04 プラン説明（新規事業説明会）
  vid(21, 'plan_intro', '中村佳世',   1, { youtube_id: 'KUYqhhJ_VMY', status: 'published' }),
  vid(22, 'plan_intro', '竹之内尚也', 2, { youtube_id: '1Pf9pBZKcHs', status: 'published' }),
  // §05 クロージング（subtitle=講師名で担当タブに紐付け）
  vid(23, 'closing', '中村佳世',   1, { subtitle: '中村佳世',   youtube_id: 'GPAEvwQ8-Gs', status: 'published' }),
  vid(24, 'closing', '阿部美道',   2, { subtitle: '阿部美道',   youtube_id: '3PCylFu0lGg', status: 'published' }),
  vid(25, 'closing', '久保田幸世', 3, { subtitle: '久保田幸世', youtube_id: 'cSOg2bSuh54', status: 'published' }),
  vid(26, 'closing', '竹之内尚也', 4, { subtitle: '竹之内尚也', youtube_id: 'sX0TJ9Ubxl0', status: 'published' }),
  // §08 ボーナス（ボーナスプラン）
  vid(27, 'bonus', '西野将平', 1, { youtube_id: 'c8DiLN6lVsY', status: 'published' }),
]

// ---- FAQ（未投入） --------------------------------------------
export const LOCAL_FAQS = []

// ---- 取得関数（content.js と同じ形に整形） ---------------------
export function localSections() {
  return [...LOCAL_SECTIONS].sort((a, b) => a.sort_order - b.sort_order)
}
export function localInstructors(type) {
  return LOCAL_INSTRUCTORS
    .filter((i) => i.is_active !== false && (!type || i.type === type))
    .sort((a, b) => a.sort_order - b.sort_order)
}
export function localAllSectionVideos() {
  const grouped = {}
  for (const v of LOCAL_VIDEOS) (grouped[v.section_key] ||= []).push(maskVideoForLayer1(v))
  return grouped
}
export function localSectionVideos(sectionKey) {
  return LOCAL_VIDEOS.filter((v) => v.section_key === sectionKey).map(maskVideoForLayer1)
}
export function localPlanVideos() {
  return LOCAL_VIDEOS.filter(
    (v) => v.section_key === 'plan' && v.protection === 'layer2' && v.status === 'published' && v.youtube_id
  )
}
export function localFaqs() {
  return LOCAL_FAQS
}

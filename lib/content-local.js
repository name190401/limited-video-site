/**
 * ローカルフォールバック用コンテンツ（Supabase 不在時のオフライン表示用）。
 *
 * USE_LOCAL_CONTENT=true 運用時のコンテンツ正本。
 */

// ---- セクション（14） -----------------------------------------
export const LOCAL_SECTIONS = [
  { key: 'origin',       title: 'QUALIAの名前の由来',     sort_order: 1,  status: 'published',   body: null },
  { key: 'instructors',  title: '講師紹介',               sort_order: 2,  status: 'published',   body: null },
  { key: 'ear_opening',  title: 'オープニング',           sort_order: 3,  status: 'published',   body: null },
  { key: 'plan_intro',   title: 'プラン説明',             sort_order: 4,  status: 'published',   body: null },
  { key: 'closing',      title: 'エンディング',           sort_order: 5,  status: 'published',   body: null },
  { key: 'instagram',    title: 'Instagram',              sort_order: 6,  status: 'published',   body: null },
  { key: 'bonus',        title: 'ボーナス（インカム）',   sort_order: 7,  status: 'published', body: null },
  { key: 'products',     title: '製品',                   sort_order: 8,  status: 'published', body: null },
  { key: 'training',     title: 'トレーニング',           sort_order: 9,  status: 'published', body: null },
  { key: 'registration', title: '登録の流れ',             sort_order: 10, status: 'published', body: null },
  { key: 'how_to_use',   title: 'QUALIAページの使い方',   sort_order: 11, status: 'published', body: null },
  { key: 'kitamura',     title: '北村弁護士の副業のすすめ', sort_order: 12, status: 'published', body: null },
  { key: 'compliance',   title: '法令遵守',               sort_order: 13, status: 'published', body: null },
  { key: 'faq',          title: 'よくある質問',           sort_order: 14, status: 'published', body: null },
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
    { region: '千葉県', age: 35, hero_photo_url: '/instructors/01-ishii-ryo-avatar.jpg', furigana: 'いしいりょう' }),
  lec(10, '久保田幸世', 2,
    '中卒シングルマザー、NBで13年間うまくいかず、QUALIAに手段を変えて人生大変化‼',
    '/instructors/10-kubota-sachiyo.jpg',
    { furigana: 'くぼたさちよ' }),
  lec(2, '中村佳世', 3,
    '産後1ヶ月半でスタート！諦め癖のあった私がいつからでもチャレンジできることを体現しています。このビジネスの可能性を感じてください。',
    '/instructors/02-nakamura-kayo.jpg',
    { furigana: 'なかむらかよ' }),
  lec(4, '阿部美道', 4,
    '株式会社DCT代表取締役\n20代で不動産全国1位を達成\n29歳で独立し事業展開\n不動産・人材・コンサルで活動\n「人の役に立つ」が理念',
    '/instructors/04-abe-mimichi.jpg',
    { furigana: 'あべはるただ' }),
  lec(11, '竹之内尚也', 5,
    '元お笑い芸人から看護師まで幅広い経験を経て見た目もライフスタイルも激変した鹿児島の歩くbefore＆after男！',
    '/instructors/11-takenouchi-naoya.jpg',
    { furigana: 'たけのうちなおや' }),
  lec(3, '高橋剛輝', 6,
    '22歳からMLMスタート\n30歳でQUALIAビジネスと出会い\n2年で2500人チーム構築',
    '/instructors/03-takahashi-goki.jpg',
    { furigana: 'たかはしこうき' }),
  lec(9, '岡田由加里', 7,
    '育休中に"時間も収入も叶える働き方"を実現\n子供との時間も収入も諦めたくないママへ\n「普通のママでもできる」を発信中',
    '/instructors/09-okada-yukari.jpg',
    { furigana: 'おかだゆかり' }),
  lec(5, '中矢真理', 8,
    '20年間専業主婦、\n前NBで8年間するが上手くいかず、フィールドをQUALIA変えたら9ヶ月で人生激変！',
    '/instructors/05-nakaya-mari.jpg',
    { furigana: 'なかやまり' }),
  lec(8, '西野将平', 9,
    '22歳からこの業界に携わり、想像以上の経験とライフスタイルを手にする事が出来ました！\n是非こちらのコンテンツでこのビジネスの可能性を見つけてください^ ^',
    '/instructors/08-nishino-shohei.jpg',
    { furigana: 'にしのしょうへい' }),
  lec(6, '丹治郁子', 10,
    'ヘルニアを機に権利収入へ。\n誰もが収入を得られる環境が整った石井諒チームに移籍。',
    '/instructors/06-tanji-ikuko.jpg',
    { furigana: 'たんじいくこ' }),
  lec(13, '伴隆', 11,
    '30歳からMLMスタート\n43歳でQUALIAビジネスと出会い\nスタート約半年で招待旅行を獲得',
    '/instructors/13-ban-takashi.jpg',
    { furigana: 'ばんたかし' }),
  lec(14, '中村正人', 12,
    '24歳でMLMスタート\n43歳でQUALIAに移籍\n前社、QUALIA共に招待旅行獲得',
    '/instructors/14-nakamura-masato.jpg',
    { furigana: 'なかむらまさと' }),
  lec(12, '小林一貴', 13,
    '前社では8年やって最高月収8万\nQUALIAでは登録して3日で7万、4日で9万と前社の最高月収を4日で更新',
    '/instructors/12-kobayashi-kazuki.jpg',
    { furigana: 'こばやしかずき' }),
  lec(7, '宮地百絵', 14,
    'QUALIA参入から１ヶ月で離婚\n毎月大好きな旅行に\nシングルマザーでも自由を選べる毎日に！',
    '/instructors/07-miyaji-momoe.jpg',
    { furigana: 'みやじももえ' }),
  // ── クロージング担当（type='closer'・§05タブ専用。§02 lecturer とは別レコード）──
  lec(15, '中村佳世',   15, null, null, { type: 'closer' }),
  lec(16, '阿部美道',   16, null, null, { type: 'closer' }),
  lec(17, '久保田幸世', 17, null, null, { type: 'closer' }),
  lec(18, '竹之内尚也', 18, null, null, { type: 'closer' }),
]

// ---- 動画 ------------------------------------------------------
const vid = (id, section_key, title, sort_order, o = {}) => ({
  id, section_key, title, subtitle: o.subtitle ?? null, youtube_id: o.youtube_id ?? null,
  variant: o.variant ?? null,
  tab_label: o.tab_label ?? null, audio_muted: o.audio_muted ?? false,
  status: o.status ?? 'coming_soon', sort_order,
})
export const LOCAL_VIDEOS = [
  vid(1, 'training', 'FA',           1, { subtitle: '中村佳世（なかむらかよ）', youtube_id: 'MSmZCalPv8k', status: 'published' }),
  vid(2, 'training', 'BMT',          2, { subtitle: '高橋剛輝（たかはしこうき）', youtube_id: '_dI-H_n7-Hs', status: 'published' }),
  vid(3, 'training', "Woman's Life", 3, { subtitle: '阿部美道（あべはるただ）', youtube_id: 'VGE1ldPVLK8', status: 'published' }),
  vid(4, 'training', '経済セミナー', 4, { subtitle: 'みっくん', youtube_id: 'ZC0cfGnM3RU', status: 'published' }),
  vid(5, 'training', 'ルーツ',       5, { subtitle: '小林一貴（こばやしかずき）', youtube_id: 'n-XHJeTc2Lc', status: 'published' }),
  vid(6, 'training', '噛み砕き',     6, { subtitle: '伴隆（ばんたかし）', youtube_id: 'H3ZscAXE4w8', status: 'published' }),
  vid(7, 'training', 'フレッシュ',   7, { subtitle: '中村正人（なかむらまさと）', youtube_id: 'hWvsTr2v1Co', status: 'published' }),
  vid(8, 'training', 'MAPの書き方',  8, { subtitle: 'みっくん', youtube_id: 'xj6dIKdqo1c', status: 'published' }),
  vid(9, 'training', '福利厚生', 9, { subtitle: '丹治郁子（たんじいくこ）', youtube_id: 'a5CTH5irn6I', status: 'published' }),
  vid(12, 'products', '製品（パーソナル）', 1, { youtube_id: 'tuSEuVC6SQU', status: 'published', variant: 'short', tab_label: 'パーソナル', audio_muted: false }),
  vid(13, 'products', '製品（プロダクト全15品）', 2, { youtube_id: '4gJvVLprXJg', status: 'published', variant: 'long', tab_label: '全15品' }),
  vid(33, 'products', '製品（BELLEQUAGE：UV入り）', 3, { youtube_id: 'XOo-ifRXVBw', status: 'published', variant: 'long', tab_label: 'BELLEQUAGE' }),
  vid(34, 'products', '製品（インナーケア）', 4, { youtube_id: 'cbi5ySSheBA', status: 'published', variant: 'long', tab_label: 'インナーケア' }),
  // ── 事業説明ファネル動画（講師陣ファイル由来・全て published）──
  // §03 オープニング（導入）
  vid(14, 'ear_opening', '中村佳世・中村正人', 1, { youtube_id: 'ySzQg8d3iQ4', status: 'published' }),
  vid(15, 'ear_opening', '阿部美道',   2, { youtube_id: 'GYp6q1XNDr4', status: 'published' }),
  vid(16, 'ear_opening', '中矢真理',   3, { youtube_id: '19RgaxonW5Q', status: 'published' }),
  vid(17, 'ear_opening', '丹治郁子',   4, { youtube_id: 'etWgf_7JA6I', status: 'published' }),
  vid(18, 'ear_opening', '宮地百絵',   5, { youtube_id: '9P9myBeBy2Q', status: 'published' }),
  vid(19, 'ear_opening', '岡田由加里', 6, { youtube_id: 'j0UfpCtr-n0', status: 'published' }),
  vid(20, 'ear_opening', '久保田幸世', 7, { youtube_id: 'VTDkDjt4rIk', status: 'published' }),
  // §04 プラン説明（新規事業説明会）
  vid(21, 'plan_intro', '中村佳世',   1, { youtube_id: 'KUYqhhJ_VMY', status: 'published', variant: 'long' }),
  vid(22, 'plan_intro', '竹之内尚也', 2, { youtube_id: '1Pf9pBZKcHs', status: 'published', variant: 'long' }),
  // §05 エンディング（subtitle=講師名で担当タブに紐付け）
  vid(23, 'closing', '中村佳世',   1, { subtitle: '中村佳世',   youtube_id: 'GPAEvwQ8-Gs', status: 'published' }),
  vid(24, 'closing', '阿部美道',   2, { subtitle: '阿部美道',   youtube_id: '3PCylFu0lGg', status: 'published' }),
  vid(25, 'closing', '久保田幸世', 3, { subtitle: '久保田幸世', youtube_id: 'cSOg2bSuh54', status: 'published' }),
  vid(26, 'closing', '竹之内尚也', 4, { subtitle: '竹之内尚也', youtube_id: 'sX0TJ9Ubxl0', status: 'published' }),
  // §07 ボーナス（ボーナスプラン）
  vid(27, 'bonus', '西野将平', 1, { youtube_id: 'c8DiLN6lVsY', status: 'published' }),
  vid(28, 'plan_intro', '【新規ABC 30分男性バージョン】', 3, { youtube_id: 'AcxykSFFl4o', status: 'published', variant: 'short' }),
  vid(29, 'plan_intro', '【新規ABC 30分女性バージョン】', 4, { youtube_id: 'Q2aHPK7DaBE', status: 'published', variant: 'short' }),
  vid(30, 'bonus', 'スポンサリングシェア、サクセス、インカム', 2, { youtube_id: '1k9wXYFFOVU', status: 'published' }),
  // §11 QUALIA ページの使い方
  vid(31, 'how_to_use', 'QUALIAページの使い方', 1, { youtube_id: 'jeCttlIq6ss', status: 'published' }),
  vid(32, 'kitamura', '北村弁護士の副業のすすめ', 1, { youtube_id: 'yWXjj0n27GQ', status: 'published' }),
  vid(35, 'compliance', 'コンプライアンス', 1, { youtube_id: '32djx73PG1k', status: 'published' }),
]

// ---- FAQ ------------------------------------------------------
export const LOCAL_FAQS = [
  { id: 1, question: '返品できますか？', answer: '返品可能です。', sort_order: 1, status: 'published' },
  { id: 2, question: '友達に絶対言わなきゃいけないですか？', answer: '自由です。\nビジネスツールとしてシェアする事も可能です。', sort_order: 2, status: 'published' },
  { id: 3, question: 'なにをしたらいいのかわかりません', answer: 'サポート体制、365日学べる環境があるのでご安心ください。\nリーダーに是非ご相談ください。', sort_order: 3, status: 'published' },
  { id: 4, question: '支払い方法の種類を教えてください', answer: '初回購入は、クレジット払い、もしくは銀行振り込みとなります。\n定期購入は、クレジット払い、もしくは口座引き落としとなります。', sort_order: 4, status: 'published' },
  { id: 5, question: '配送先住所を変えれますか？', answer: '登録住所とは異なる住所を配送先にすることが可能です。', sort_order: 5, status: 'published' },
  { id: 6, question: '定期購入の変更は可能ですか？', answer: '毎月可能です。\n口座引き落としの場合は前月10日までに、クレジット払いの場合は前月20日までに変更していただければ、変更が可能となります。\n長期連休などは例外がありますので、ご注意ください', sort_order: 6, status: 'published' },
  { id: 7, question: '定期購入をどれぐらい止めたら解約になりますか？', answer: '12ヶ月連続で止めると解約になります', sort_order: 7, status: 'published' },
  { id: 8, question: 'ポイントは定期を止めるとなくなりますか？', answer: 'セービングウォレット、Qpayポイントは定期購入を止めると無くなりますが、最低4000pt以上の製品購入でキープされます', sort_order: 8, status: 'published' },
]

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
  for (const v of LOCAL_VIDEOS) (grouped[v.section_key] ||= []).push(v)
  return grouped
}
export function localSectionVideos(sectionKey) {
  return LOCAL_VIDEOS.filter((v) => v.section_key === sectionKey)
}
export function localFaqs() {
  return LOCAL_FAQS
}

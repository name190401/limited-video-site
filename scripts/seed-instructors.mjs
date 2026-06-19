// 講師陣13名を Supabase instructors テーブルへ投入する一回限りのシード。
// 正本は supabase/migrations/003_seed_instructors.sql。本スクリプトはそれをライブDBへ適用する。
//   実行: video-site/ で  `node scripts/seed-instructors.mjs`
// 冪等: 石井諒以外の lecturer を削除 → 石井が無ければ復元 → 13名を挿入。再実行可。
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// .env.local を素朴にパース（standalone node は Next の env を読まないため）
const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
}
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が .env.local に見つかりません')
  process.exit(1)
}
const supabase = createClient(url, key, { auth: { persistSession: false } })

// プロフィール文書（講師陣/講師陣）準拠。氏名は文書表記が正。
const ISHII = {
  name: '石井諒', type: 'lecturer', region: '千葉県', age: 35,
  profile: '22歳からネットワークビジネスをSTART、31歳でQUALIAと出会い、最高タイトルを最年少・最速で獲得。',
  sort_order: 1,
}
const LECTURERS = [
  { name: '中村佳世', sort_order: 2,  photo_url: '/instructors/02-nakamura-kayo.jpg',
    profile: '産後1ヶ月半でスタート！諦め癖のあった私がいつからでもチャレンジできることを体現しています。このビジネスの可能性を感じてください。' },
  { name: '高橋剛輝', sort_order: 3,  photo_url: '/instructors/03-takahashi-goki.jpg',
    profile: '22歳からMLMスタート\n30歳でQUALIAビジネスと出会い\n2年で2500人チーム構築' },
  { name: '阿部美道', sort_order: 4,  photo_url: '/instructors/04-abe-mimichi.jpg',
    profile: '株式会社DCT代表取締役\n20代で不動産全国1位を達成\n29歳で独立し事業展開\n不動産・人材・コンサルで活動\n「人の役に立つ」が理念' },
  { name: '中矢真理', sort_order: 5,  photo_url: '/instructors/05-nakaya-mari.jpg',
    profile: '20年間専業主婦、\n前NBで8年間するが上手くいかず、フィールドをQUALIA変えたら9ヶ月で人生激変！' },
  { name: '丹治郁子', sort_order: 6,  photo_url: '/instructors/06-tanji-ikuko.jpg',
    profile: 'ヘルニアを機に権利収入へ。\n誰もが収入を得られる環境が整った石井諒チームに移籍。' },
  { name: '宮地百絵', sort_order: 7,  photo_url: '/instructors/07-miyaji-momoe.jpg',
    profile: 'QUALIA参入から１ヶ月で離婚\n毎月大好きな旅行に\nシングルマザーでも自由を選べる毎日に！' },
  { name: '西野将平', sort_order: 8,  photo_url: '/instructors/08-nishino-shohei.jpg',
    profile: '22歳からこの業界に携わり、想像以上の経験とライフスタイルを手にする事が出来ました！\n是非こちらのコンテンツでこのビジネスの可能性を見つけてください^ ^' },
  { name: '岡田由加里', sort_order: 9, photo_url: '/instructors/09-okada-yukari.jpg',
    profile: '育休中に"時間も収入も叶える働き方"を実現\n子供との時間も収入も諦めたくないママへ\n「普通のママでもできる」を発信中' },
  { name: '久保田幸世', sort_order: 10, photo_url: '/instructors/10-kubota-sachiyo.jpg',
    profile: '中卒シングルマザー、NBで13年間うまくいかず、QUALIAに手段を変えて人生大変化‼' },
  { name: '竹之内尚也', sort_order: 11, photo_url: '/instructors/11-takenouchi-naoya.jpg',
    profile: '元お笑い芸人から看護師まで幅広い経験を経て見た目もライフスタイルも激変した鹿児島の歩くbefore＆after男！' },
  { name: '小林一貴', sort_order: 12, photo_url: '/instructors/12-kobayashi-kazuki.jpg',
    profile: '前社では8年やって最高月収8万\nQUALIAでは登録して3日で7万、4日で9万と前社の最高月収を4日で更新' },
  { name: '伴隆', sort_order: 13, photo_url: '/instructors/13-ban-takashi.jpg',
    profile: '30歳からMLMスタート\n43歳でQUALIAビジネスと出会い\nスタート約半年で招待旅行を獲得' },
  { name: '中村正人', sort_order: 14, photo_url: '/instructors/14-nakamura-masato.jpg',
    profile: '24歳でMLMスタート\n43歳でQUALIAに移籍\n前社、QUALIA共に招待旅行獲得' },
].map((l) => ({ ...l, type: 'lecturer', status: 'published', is_active: true }))

async function main() {
  // 1) 石井以外の lecturer を削除
  const del = await supabase.from('instructors').delete().eq('type', 'lecturer').neq('name', '石井諒')
  if (del.error) throw del.error

  // 2) 石井諒が無ければ復元
  const { data: ishii, error: e1 } = await supabase
    .from('instructors').select('id').eq('type', 'lecturer').eq('name', '石井諒')
  if (e1) throw e1
  if (!ishii?.length) {
    const ins = await supabase.from('instructors').insert(ISHII)
    if (ins.error) throw ins.error
    console.log('石井諒 を復元しました')
  }

  // 3) 13名を挿入
  const ins = await supabase.from('instructors').insert(LECTURERS)
  if (ins.error) throw ins.error

  // 4) 検証: lecturer 一覧を sort_order 順で出力
  const { data: all, error: e2 } = await supabase
    .from('instructors')
    .select('sort_order, name, photo_url, status, is_active')
    .eq('type', 'lecturer').eq('is_active', true)
    .order('sort_order')
  if (e2) throw e2
  console.log(`\n=== lecturer ${all.length} 名（sort_order 順）===`)
  for (const r of all) {
    console.log(`${String(r.sort_order).padStart(2)}  ${r.name.padEnd(7)}  ${r.photo_url || '(写真なし)'}  [${r.status}]`)
  }
  console.log('\n✅ 投入完了')
}

main().catch((err) => {
  console.error('❌ 失敗:', err.message || err)
  process.exit(1)
})

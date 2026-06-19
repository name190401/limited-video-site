-- ============================================================
-- 003: 講師陣 実データ投入（2026-06-19）
-- ------------------------------------------------------------
-- ・石井諒（主役 / castle 講師 / sort_order=1）は維持。
-- ・旧プレースホルダーの lecturer（竹之内 等）は一旦削除し、
--   提供された13名で置き換える（竹之内は新プロフィールで再登録）。
-- ・氏名はプロフィール文書の表記が正（写真ファイル名の旧字は不採用）。
-- ・写真は public/instructors/ 配下のルート相対パスを photo_url に格納。
-- ・region / age / attribute_tags は未提供のため null（UI 側で自動非表示）。
-- 冪等: 石井以外の lecturer を削除 → 13名を挿入。再実行可。
-- ============================================================

-- 石井以外の旧 lecturer を除去
delete from public.instructors where type = 'lecturer' and name <> '石井諒';

-- 石井諒（万一存在しなければ復元）
insert into public.instructors (name, type, region, age, profile, sort_order)
select '石井諒', 'lecturer', '千葉県', 35,
       '22歳からネットワークビジネスをSTART、31歳でQUALIAと出会い、最高タイトルを最年少・最速で獲得。', 1
where not exists (
  select 1 from public.instructors where type = 'lecturer' and name = '石井諒'
);

-- 提供13名（sort_order 2〜14・プロフィール文書準拠）
insert into public.instructors (name, type, profile, photo_url, sort_order, status, is_active) values
  ('中村佳世', 'lecturer',
   E'産後1ヶ月半でスタート！諦め癖のあった私がいつからでもチャレンジできることを体現しています。このビジネスの可能性を感じてください。',
   '/instructors/02-nakamura-kayo.jpg', 2, 'published', true),
  ('高橋剛輝', 'lecturer',
   E'22歳からMLMスタート\n30歳でQUALIAビジネスと出会い\n2年で2500人チーム構築',
   '/instructors/03-takahashi-goki.jpg', 3, 'published', true),
  ('阿部美道', 'lecturer',
   E'株式会社DCT代表取締役\n20代で不動産全国1位を達成\n29歳で独立し事業展開\n不動産・人材・コンサルで活動\n「人の役に立つ」が理念',
   '/instructors/04-abe-mimichi.jpg', 4, 'published', true),
  ('中矢真理', 'lecturer',
   E'20年間専業主婦、\n前NBで8年間するが上手くいかず、フィールドをQUALIA変えたら9ヶ月で人生激変！',
   '/instructors/05-nakaya-mari.jpg', 5, 'published', true),
  ('丹治郁子', 'lecturer',
   E'ヘルニアを機に権利収入へ。\n誰もが収入を得られる環境が整った石井諒チームに移籍。',
   '/instructors/06-tanji-ikuko.jpg', 6, 'published', true),
  ('宮地百絵', 'lecturer',
   E'QUALIA参入から１ヶ月で離婚\n毎月大好きな旅行に\nシングルマザーでも自由を選べる毎日に！',
   '/instructors/07-miyaji-momoe.jpg', 7, 'published', true),
  ('西野将平', 'lecturer',
   E'22歳からこの業界に携わり、想像以上の経験とライフスタイルを手にする事が出来ました！\n是非こちらのコンテンツでこのビジネスの可能性を見つけてください^ ^',
   '/instructors/08-nishino-shohei.jpg', 8, 'published', true),
  ('岡田由加里', 'lecturer',
   E'育休中に"時間も収入も叶える働き方"を実現\n子供との時間も収入も諦めたくないママへ\n「普通のママでもできる」を発信中',
   '/instructors/09-okada-yukari.jpg', 9, 'published', true),
  ('久保田幸世', 'lecturer',
   E'中卒シングルマザー、NBで13年間うまくいかず、QUALIAに手段を変えて人生大変化‼',
   '/instructors/10-kubota-sachiyo.jpg', 10, 'published', true),
  ('竹之内尚也', 'lecturer',
   E'元お笑い芸人から看護師まで幅広い経験を経て見た目もライフスタイルも激変した鹿児島の歩くbefore＆after男！',
   '/instructors/11-takenouchi-naoya.jpg', 11, 'published', true),
  ('小林一貴', 'lecturer',
   E'前社では8年やって最高月収8万\nQUALIAでは登録して3日で7万、4日で9万と前社の最高月収を4日で更新',
   '/instructors/12-kobayashi-kazuki.jpg', 12, 'published', true),
  ('伴隆', 'lecturer',
   E'30歳からMLMスタート\n43歳でQUALIAビジネスと出会い\nスタート約半年で招待旅行を獲得',
   '/instructors/13-ban-takashi.jpg', 13, 'published', true),
  ('中村正人', 'lecturer',
   E'24歳でMLMスタート\n43歳でQUALIAに移籍\n前社、QUALIA共に招待旅行獲得',
   '/instructors/14-nakamura-masato.jpg', 14, 'published', true);

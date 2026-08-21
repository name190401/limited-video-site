-- ============================================================
-- QUALIA リビルド版スキーマ（v2）
-- 旧 001（Supabase Auth / profiles / auth.uid ベース RLS）を破棄し、
-- service-role からのみ読み書きする構成へ作り替える。
--
-- 方針:
--  - 全テーブルで RLS を有効化し、**公開ポリシーを一切作らない**。
--    → anon キー（ブラウザ）からは読めず、service-role のみがアクセスできる。
--    保護コンテンツ（layer2 の youtube_id）がクライアントに漏れない（先方原則②）。
--  - 認証は Supabase Auth を使わない（Layer1 共通パスワード + Layer2 日替わりパス）。
-- ============================================================

-- ---- 旧スキーマの破棄 --------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.access_logs cascade;
drop table if exists public.videos cascade;
drop table if exists public.video_groups cascade;
drop table if exists public.closers cascade;
drop table if exists public.leaders cascade;
drop table if exists public.profiles cascade;

-- ---- 新スキーマも毎回作り直せるよう先に破棄（再実行を冪等にする） ----
drop table if exists public.faqs cascade;
drop table if exists public.rate_limits cascade;
drop table if exists public.settings cascade;
drop table if exists public.instructors cascade;
-- videos / sections は FK 関係があるため videos を先に
drop table if exists public.videos cascade;
drop table if exists public.sections cascade;

-- ---- セクション（13セクションのメタ＋本文） ----------------
create table public.sections (
  key         text primary key,          -- 'origin','instructors','plan',...
  title       text not null,
  body        text,                       -- 由来・使い方等の本文（任意）
  sort_order  integer not null default 0,
  status      text not null default 'published' check (status in ('published','coming_soon')),
  updated_at  timestamptz default now()
);

-- ---- 講師・クロージング担当 --------------------------------
create table public.instructors (
  id              bigint generated always as identity primary key,
  name            text not null,
  type            text not null default 'lecturer' check (type in ('lecturer','closer')),
  region          text,                   -- 出身地
  age             integer,
  profile         text,
  photo_url       text,                   -- Supabase Storage の公開 URL
  attribute_tags  text[] default '{}',    -- 紹介者の絞り込み用（性別/年代/職業 等）
  youtube_id      text,                   -- 紹介/クロージング動画（任意）
  sort_order      integer not null default 0,
  status          text not null default 'published' check (status in ('published','coming_soon')),
  is_active       boolean not null default true,
  created_at      timestamptz default now()
);

-- ---- 動画（汎用セクション動画） ----------------------------
-- 耳開け/プラン説明/プラン/ボーナス/製品/トレーニング/登録/使い方 などの動画。
create table public.videos (
  id           bigint generated always as identity primary key,
  section_key  text not null references public.sections(key) on delete cascade,
  title        text not null,
  subtitle     text,                       -- 担当者名・補足（例: トレーニングの講師名）
  youtube_id   text,                       -- 未設定なら「準備中」表示
  protection   text not null default 'layer1' check (protection in ('layer1','layer2')),
  variant      text check (variant in ('short','long')),  -- プラン/製品の区分（任意）
  audio_muted  boolean not null default false,            -- 製品ショート（音声なし）用
  status       text not null default 'published' check (status in ('published','coming_soon')),
  sort_order   integer not null default 0,
  created_at   timestamptz default now()
);
create index videos_section_idx on public.videos(section_key, sort_order);

-- ---- FAQ ---------------------------------------------------
create table public.faqs (
  id          bigint generated always as identity primary key,
  question    text not null,
  answer      text not null,
  sort_order  integer not null default 0,
  status      text not null default 'published' check (status in ('published','coming_soon')),
  created_at  timestamptz default now()
);

-- ---- 可変設定（サイト共通PW・管理PW 等） -------------------
create table public.settings (
  key         text primary key,           -- 現行は 'admin_password' のみ（'site_password' 系は 2026-08-21 の1層化で不使用）
  value       text not null,
  updated_at  timestamptz default now()
);

-- ---- レート制限 --------------------------------------------
create table public.rate_limits (
  key           text primary key,         -- 'env:scope:ip:jstDate'（env は VERCEL_ENV ?? 'local'。lib/ratelimit.js が正）
  attempts      integer not null default 0,
  window_start  timestamptz,
  locked_until  timestamptz
);

-- ============================================================
-- RLS: 全テーブル有効化・公開ポリシー無し（service-role のみ）
-- ============================================================
alter table public.sections    enable row level security;
alter table public.instructors enable row level security;
alter table public.videos      enable row level security;
alter table public.faqs        enable row level security;
alter table public.settings    enable row level security;
alter table public.rate_limits enable row level security;
-- ※ create policy は意図的に書かない。anon/authenticated からは一切アクセス不可。

-- ============================================================
-- 初期データ（13セクション）
-- ============================================================
insert into public.sections (key, title, sort_order, status, body) values
  ('origin',       'QUALIAの名前の由来',     1,  'published',   null),
  ('instructors',  '講師紹介',               2,  'published',   null),
  ('ear_opening',  '耳開け・導入',           3,  'coming_soon', null),
  ('plan_intro',   'プラン説明',             4,  'coming_soon', null),
  ('closing',      'クロージング',           5,  'coming_soon', null),
  ('instagram',    'Instagram',              6,  'published',   null),
  ('plan',         'プラン',                 7,  'coming_soon', null),
  ('bonus',        'ボーナス（インカム）',   8,  'coming_soon', null),
  ('products',     '製品',                   9,  'coming_soon', null),
  ('training',     'トレーニング',           10, 'coming_soon', null),
  ('registration', '登録の流れ',             11, 'coming_soon', null),
  ('how_to_use',   'QUALIAページの使い方',   12, 'coming_soon', null),
  ('faq',          'よくある質問',           13, 'published',   null);

-- 講師（サンプル：トップ画面サンプル準拠。写真は後で管理画面からアップロード）
insert into public.instructors (name, type, region, age, profile, sort_order) values
  ('石井諒',     'lecturer', '千葉県',   35, '22歳からネットワークビジネスをSTART、31歳でQUALIAと出会い、最高タイトルを最年少・最速で獲得。', 1),
  ('竹之内尚也', 'lecturer', '鹿児島',   38, 'トラベルナースをしながら全国各地へ。MLMに対して最悪から最高へ。', 2);

-- トレーニング9項目（担当を subtitle に。動画は後日 → coming_soon）
insert into public.videos (section_key, title, subtitle, protection, status, sort_order) values
  ('training', 'FA',            'かよさん',   'layer1', 'coming_soon', 1),
  ('training', 'BMT',           'こうきくん', 'layer1', 'coming_soon', 2),
  ('training', 'ウーマン',      'はるくん',   'layer1', 'coming_soon', 3),
  ('training', '経済セミナー',  'みっくん',   'layer1', 'coming_soon', 4),
  ('training', 'ルーツ',        'かずき',     'layer1', 'coming_soon', 5),
  ('training', '噛み砕き',      '尚也くん',   'layer1', 'coming_soon', 6),
  ('training', 'フレッシュ',    '正人さん',   'layer1', 'coming_soon', 7),
  ('training', 'MAPの書き方',   'みっくん',   'layer1', 'coming_soon', 8),
  ('training', 'QUALIAパーク・共済（福利厚生）', '担当未定', 'layer1', 'coming_soon', 9);

-- プラン（Layer2 保護・ショート/ロング・動画は後日）
insert into public.videos (section_key, title, variant, protection, status, sort_order) values
  ('plan', 'ショートプラン', 'short', 'layer2', 'coming_soon', 1),
  ('plan', 'ロングプラン',   'long',  'layer2', 'coming_soon', 2);

-- 製品（ショート=音声なし・後日）
insert into public.videos (section_key, title, variant, audio_muted, protection, status, sort_order) values
  ('products', '製品ショート', 'short', true,  'layer1', 'coming_soon', 1),
  ('products', '製品ロング',   'long',  false, 'layer1', 'coming_soon', 2);

-- ============================================
-- 限定公開プレゼンテーションシステム - 初期スキーマ
-- ============================================

-- プロフィール（Supabase Auth ユーザーの拡張）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  role text not null default 'member' check (role in ('member', 'leader', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 新規ユーザー作成時にプロフィールを自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- リーダー紹介セクション
create table public.leaders (
  id serial primary key,
  name text not null,
  age integer,
  photo_url text,
  profile_text text,
  youtube_video_id text,
  video_duration_minutes integer default 5,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- クロージングセクション
create table public.closers (
  id serial primary key,
  name text not null,
  photo_url text,
  profile_text text,
  youtube_video_id text,
  video_duration_minutes integer default 5,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 動画グループ（パスワード単位）
create table public.video_groups (
  id serial primary key,
  group_index integer not null unique,
  name text not null,
  description text,
  sort_order integer default 0,
  is_active boolean default true
);

-- 事業説明動画
create table public.videos (
  id serial primary key,
  title text not null,
  description text,
  youtube_video_id text not null,
  duration_minutes integer,
  video_group_id integer references public.video_groups(id) on delete set null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- アクセスログ
create table public.access_logs (
  id bigserial primary key,
  user_id uuid references auth.users on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.leaders enable row level security;
alter table public.closers enable row level security;
alter table public.video_groups enable row level security;
alter table public.videos enable row level security;
alter table public.access_logs enable row level security;

-- profiles: 自分のプロフィールのみ読み書き可能
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- leaders: ログインユーザーは閲覧可能
create policy "Authenticated users can read leaders"
  on public.leaders for select
  to authenticated
  using (is_active = true);

-- closers: ログインユーザーは閲覧可能
create policy "Authenticated users can read closers"
  on public.closers for select
  to authenticated
  using (is_active = true);

-- video_groups: ログインユーザーは閲覧可能
create policy "Authenticated users can read video_groups"
  on public.video_groups for select
  to authenticated
  using (is_active = true);

-- videos: ログインユーザーは閲覧可能
create policy "Authenticated users can read videos"
  on public.videos for select
  to authenticated
  using (is_active = true);

-- access_logs: 自分のログのみ書き込み可能
create policy "Users can insert own logs"
  on public.access_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================
-- 管理者用ポリシー（role = 'admin'）
-- ============================================

create policy "Admins can manage leaders"
  on public.leaders for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage closers"
  on public.closers for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage video_groups"
  on public.video_groups for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage videos"
  on public.videos for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 管理者はすべてのプロフィールを閲覧可能
create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- サンプルデータ
-- ============================================

-- 動画グループ
insert into public.video_groups (group_index, name, description, sort_order) values
  (0, '基本セット', 'フルバージョン・単体版・ボーナス解説', 0),
  (1, '製品・トレーニング', '製品説明・トレーニング・実践ガイド', 1),
  (2, '応用セット', '応用戦略・ケーススタディ・Q&A', 2);

-- サンプル動画（YouTube IDはプレースホルダー）
insert into public.videos (title, description, youtube_video_id, duration_minutes, video_group_id, sort_order) values
  ('フルバージョン', '事業説明の完全版です', 'dQw4w9WgXcQ', 90, 1, 0),
  ('単体版', '短縮バージョン', 'dQw4w9WgXcQ', 30, 1, 1),
  ('ボーナス解説', 'ボーナスプランの詳細解説', 'dQw4w9WgXcQ', 15, 1, 2),
  ('製品説明', '製品ラインナップの紹介', 'dQw4w9WgXcQ', 20, 2, 0),
  ('トレーニング', '基本的なトレーニング内容', 'dQw4w9WgXcQ', 25, 2, 1),
  ('実践ガイド', '実際の活動方法', 'dQw4w9WgXcQ', 20, 2, 2),
  ('応用戦略', '上級者向け戦略', 'dQw4w9WgXcQ', 30, 3, 0),
  ('ケーススタディ', '成功事例の紹介', 'dQw4w9WgXcQ', 20, 3, 1),
  ('Q&A', 'よくある質問への回答', 'dQw4w9WgXcQ', 15, 3, 2);

-- サンプルリーダー
insert into public.leaders (name, age, photo_url, profile_text, youtube_video_id, video_duration_minutes, sort_order) values
  ('田中太郎', 45, null, '20年以上のビジネス経験を持つトップリーダー。これまで数百人のメンバーを育成。', 'dQw4w9WgXcQ', 7, 0),
  ('鈴木花子', 38, null, 'シングルマザーから起業。子育てと両立しながら成果を上げた経験を語ります。', 'dQw4w9WgXcQ', 5, 1),
  ('佐藤健一', 52, null, '元銀行員。堅実な視点からビジネスの魅力をお伝えします。', 'dQw4w9WgXcQ', 5, 2),
  ('山田美咲', 29, null, '最年少リーダー。若い世代の視点から新しいビジネスの形を提案します。', 'dQw4w9WgXcQ', 5, 3);

-- サンプルクロージング担当
insert into public.closers (name, photo_url, profile_text, youtube_video_id, video_duration_minutes, sort_order) values
  ('中村直樹', null, '「最初は半信半疑でした」自身の体験談から、一歩を踏み出す大切さを伝えます。', 'dQw4w9WgXcQ', 5, 0),
  ('高橋さくら', null, '「やる前に悩むより、やりながら考える」をモットーに活動中。', 'dQw4w9WgXcQ', 5, 1),
  ('渡辺一郎', null, '定年後にスタート。年齢を超えた挑戦の楽しさをお話しします。', 'dQw4w9WgXcQ', 5, 2),
  ('小林真理', null, 'ネットワークビジネスへの不安を解消する「予防接種」的トーク担当。', 'dQw4w9WgXcQ', 7, 3);

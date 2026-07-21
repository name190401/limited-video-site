-- アクセス履歴（service-role 専用）
create table public.login_events (
  id    bigint generated always as identity primary key,
  ts    timestamptz not null default now(),
  kind  text not null check (kind in ('member', 'admin', 'unlock')),
  ip    text,
  ua    text
);

create table public.play_events (
  id          bigint generated always as identity primary key,
  ts          timestamptz not null default now(),
  youtube_id  text not null,
  title       text,
  ip          text,
  ua          text
);

create index login_events_ts_idx on public.login_events (ts desc);
create index play_events_ts_idx on public.play_events (ts desc);
create index play_events_youtube_id_idx on public.play_events (youtube_id);

-- 公開ポリシー無し（service-role のみ）
alter table public.login_events enable row level security;
alter table public.play_events  enable row level security;

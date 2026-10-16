-- DevFest Quest: the 4-stage game (socials, squad up, quiz rounds, partners).
-- Additive and safe to re-run. Run: npm run db:quest-stages

alter table quest_profiles add column if not exists avatar text;
alter table quest_profiles add column if not exists fun_fact text;

-- Squad up: you scanned someone's QR and answered questions about them correctly.
-- One row per direction; each player locks the other in separately.
create table if not exists quest_lockins (
  user_id   uuid not null references quest_profiles (id) on delete cascade,
  target_id uuid not null references quest_profiles (id) on delete cascade,
  at        timestamptz not null default now(),
  primary key (user_id, target_id),
  check (user_id <> target_id)
);
create index if not exists quest_lockins_target_idx on quest_lockins (target_id);
alter table quest_lockins enable row level security;

-- Wrong answers about a person; drives the retry cooldown and reshuffles the options.
create table if not exists quest_lockin_misses (
  id        bigserial primary key,
  user_id   uuid not null references quest_profiles (id) on delete cascade,
  target_id uuid not null references quest_profiles (id) on delete cascade,
  at        timestamptz not null default now()
);
create index if not exists quest_lockin_misses_idx on quest_lockin_misses (user_id, target_id, at desc);
alter table quest_lockin_misses enable row level security;

-- Quiz rounds 1-3, opened and closed by organisers from the admin page.
create table if not exists quest_rounds (
  round     int primary key check (round between 1 and 3),
  opened_at timestamptz,
  closed_at timestamptz
);
insert into quest_rounds (round) values (1), (2), (3) on conflict do nothing;
alter table quest_rounds enable row level security;

alter table quest_quiz_items add column if not exists quiz_round int check (quiz_round between 1 and 3);

-- One attempt per player per round. score = correct answers; ties go to the faster finish.
create table if not exists quest_round_plays (
  user_id     uuid not null references quest_profiles (id) on delete cascade,
  round       int  not null references quest_rounds (round),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  score       int  not null default 0,
  primary key (user_id, round)
);
alter table quest_round_plays enable row level security;

create table if not exists quest_round_answers (
  user_id uuid not null references quest_profiles (id) on delete cascade,
  item_id uuid not null references quest_quiz_items (id) on delete cascade,
  round   int  not null,
  choice  int  not null,
  correct boolean not null,
  at      timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table quest_round_answers enable row level security;

-- Starter question sets, 10 per round. Edit in the database to change them.
update quest_quiz_items set quiz_round = 1 where slug in
  ('ai-agent', 'ai-llm', 'ai-halluc', 'ai-prompt', 'ai-tools', 'ai-human', 'tr-gdg', 'tr-devfest', 'tr-theme', 'tr-jos');
update quest_quiz_items set quiz_round = 2 where slug in
  ('mob-flutter', 'mob-android', 'mob-kotlin', 'mob-offline', 'mob-perms', 'mob-reload', 'web-basics', 'web-https', 'web-resp', 'web-api');
update quest_quiz_items set quiz_round = 3 where slug in
  ('cs-cloud', 'cs-phish', 'cs-2sv', 'cs-secrets', 'cs-backup', 'cs-pass', 'web-a11y', 'web-speed', 'pc-mvp', 'pc-oss');

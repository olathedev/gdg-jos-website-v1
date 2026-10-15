-- DevFest Jos 2026 ticketing. Safe to run more than once (npm run db:migrate).

create extension if not exists pgcrypto;

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,              -- Paystack reference (or FREE-… for Regular)
  tier          text not null check (tier in ('regular', 'vip', 'padi')),
  units         int  not null check (units > 0),
  amount_kobo   int  not null check (amount_kobo >= 0),
  currency      text not null default 'NGN',
  status        text not null default 'pending'
                check (status in ('pending', 'paid', 'free', 'failed')),
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  attendees     jsonb not null,                    -- [{ name, email }] captured at checkout
  paystack      jsonb,                             -- verified transaction payload
  failure       text,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz,
  emailed_at    timestamptz
);

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_buyer_email_idx on orders (lower(buyer_email));

create table if not exists tickets (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,             -- shown on the ticket and in the QR code
  order_id       uuid not null references orders (id) on delete cascade,
  tier           text not null,
  holder_name    text not null,
  holder_email   text not null,
  checked_in_at  timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists tickets_order_idx on tickets (order_id);

-- One free (Regular) ticket per email address.
create unique index if not exists tickets_one_regular_per_email
  on tickets (lower(holder_email)) where tier = 'regular';

-- Supabase exposes the public schema through its REST API. RLS with no policies
-- blocks that API completely; the server connects as the table owner, which RLS
-- does not restrict, so ticketing keeps working.
alter table orders enable row level security;
alter table tickets enable row level security;

-- Emails sent from the admin Mail page (broadcasts, one-off messages, ticket resends).
create table if not exists mail_log (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('broadcast', 'individual', 'ticket')),
  audience    text not null,
  subject     text not null,
  body        text,
  recipients  int  not null default 0,
  sent        int  not null default 0,
  failed      int  not null default 0,
  sent_by     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists mail_log_created_idx on mail_log (created_at desc);
alter table mail_log enable row level security;

-- ---------------------------------------------------------------------------
-- Agent Mode + Level Up (/quest). Every point is a row in quest_points; the
-- leaderboard is a sum. Only server code writes these tables.
-- ---------------------------------------------------------------------------

create table if not exists quest_profiles (
  id             uuid primary key default gen_random_uuid(),
  auth_id        text not null unique,            -- Supabase Auth user id (dev: dev:<email>)
  email          text not null,
  full_name      text not null default '',
  stack          text[] not null default '{}',
  github         text,
  linkedin       text,
  x_handle       text unique,                      -- one X handle per account
  x_handle_at    timestamptz,                      -- posts count only from when the handle was added
  instagram      text,
  whatsapp       text,
  is_adult       boolean not null default false,
  listed         boolean not null default false,   -- show me in Who's coming
  share_whatsapp boolean not null default false,
  quest_token    text not null unique,             -- in the personal Agent QR
  invite_code    text not null unique,
  invited_by     uuid references quest_profiles (id) on delete set null,
  onboarded_at   timestamptz,
  created_at     timestamptz not null default now(),
  constraint quest_stack_max3 check (cardinality(stack) <= 3)
);
create index if not exists quest_profiles_email_idx on quest_profiles (lower(email));
alter table quest_profiles enable row level security;

-- One row per pair, user_a < user_b.
create table if not exists quest_connections (
  user_a       uuid not null references quest_profiles (id) on delete cascade,
  user_b       uuid not null references quest_profiles (id) on delete cascade,
  requester    uuid not null references quest_profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  primary key (user_a, user_b),
  check (user_a < user_b)
);
alter table quest_connections enable row level security;

create table if not exists quest_blocks (
  blocker    uuid not null references quest_profiles (id) on delete cascade,
  blocked    uuid not null references quest_profiles (id) on delete cascade,
  reported   boolean not null default false,
  reason     text,
  status     text not null default 'open' check (status in ('open', 'reviewed')),
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
alter table quest_blocks enable row level security;

create table if not exists quest_checkins (
  user_id uuid not null references quest_profiles (id) on delete cascade,
  day     date not null,
  at      timestamptz not null default now(),
  primary key (user_id, day)
);
alter table quest_checkins enable row level security;

create table if not exists quest_meets (
  user_a uuid not null references quest_profiles (id) on delete cascade,
  user_b uuid not null references quest_profiles (id) on delete cascade,
  at     timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
alter table quest_meets enable row level security;

-- Room doors and exhibitor booths. code goes in the printed QR (/quest/s/<code>).
create table if not exists quest_stations (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('room', 'booth')),
  name       text not null,
  code       text not null unique,
  opens_at   timestamptz,
  closes_at  timestamptz,
  created_at timestamptz not null default now()
);
alter table quest_stations enable row level security;

create table if not exists quest_station_scans (
  user_id    uuid not null references quest_profiles (id) on delete cascade,
  station_id uuid not null references quest_stations (id) on delete cascade,
  at         timestamptz not null default now(),
  primary key (user_id, station_id)
);
alter table quest_station_scans enable row level security;

-- round: daily (a dated drop), anytime (trivia and evergreen cards), recap (after a room session).
create table if not exists quest_quiz_items (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  round       text not null check (round in ('daily', 'anytime', 'recap')),
  track       text not null,
  opens_on    date,
  station_id  uuid references quest_stations (id) on delete cascade,
  learn       text not null,
  question    text not null,
  options     jsonb not null,                      -- ["A", "B", "C", "D"]
  correct     int  not null,                       -- index into options; never sent to browsers
  explanation text not null,
  sort        int  not null default 0
);
alter table quest_quiz_items enable row level security;

create table if not exists quest_quiz_answers (
  user_id uuid not null references quest_profiles (id) on delete cascade,
  item_id uuid not null references quest_quiz_items (id) on delete cascade,
  choice  int  not null,
  correct boolean not null,
  at      timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table quest_quiz_answers enable row level security;

-- The ledger. Unique per (user, source_type, source_id): nothing pays twice.
create table if not exists quest_points (
  id          bigserial primary key,
  user_id     uuid not null references quest_profiles (id) on delete cascade,
  source_type text not null,
  source_id   text not null,
  points      int  not null,
  at          timestamptz not null default now(),
  unique (user_id, source_type, source_id)
);
create index if not exists quest_points_user_idx on quest_points (user_id);
alter table quest_points enable row level security;

-- platform: x, instagram, linkedin, facebook, community
create table if not exists quest_social_claims (
  user_id    uuid not null references quest_profiles (id) on delete cascade,
  platform   text not null,
  status     text not null default 'claimed' check (status in ('claimed', 'matched', 'rejected')),
  claimed_at timestamptz not null default now(),
  primary key (user_id, platform)
);
alter table quest_social_claims enable row level security;

create table if not exists quest_x_posts (
  post_id    text primary key,
  user_id    uuid not null references quest_profiles (id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'counted', 'rejected', 'removed')),
  posted_at  timestamptz,
  reason     text,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);
alter table quest_x_posts enable row level security;

-- Small key/value store for background jobs (e.g. the X search cursor).
create table if not exists quest_meta (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table quest_meta enable row level security;

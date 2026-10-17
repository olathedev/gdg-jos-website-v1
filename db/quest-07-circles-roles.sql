-- Circles (DevFest Jos 2026 is the first), roles per circle, role invite links, partner managers.
-- Additive and safe to re-run. Apply BEFORE deploying the code that reads these tables.
--
-- Membership is implicit for now: everyone with a PadiUp profile is in the one circle, so sign-in
-- writes nothing new. Only roles above attendee are stored (no row = attendee).

create table if not exists quest_circles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  name        text not null,
  host_name   text not null,                     -- "GDG Jos", for "Follow GDG Jos"
  whatsapp_url text check (whatsapp_url ~ '^https://chat\.whatsapp\.com/'),
  x           text,
  instagram   text,
  linkedin    text,
  facebook    text,
  youtube     text,
  website_url text check (website_url ~ '^https://'),
  updated_by  uuid references quest_profiles (id) on delete set null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
alter table quest_circles enable row level security;

insert into quest_circles (slug, name, host_name, x, instagram, facebook)
values ('devfest-jos-2026', 'DevFest Jos 2026', 'GDG Jos', 'gdgjos2', 'gdg_jos', 'gdgjos')
on conflict (slug) do nothing;

create table if not exists quest_circle_roles (
  circle_id  uuid not null references quest_circles (id) on delete cascade,
  user_id    uuid not null references quest_profiles (id) on delete cascade,
  role       text not null check (role in ('speaker', 'co_organiser', 'organiser')),
  granted_by uuid references quest_profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);
create index if not exists quest_circle_roles_role on quest_circle_roles (circle_id, role);
alter table quest_circle_roles enable row level security;

-- Role invite links. Only a SHA-256 hash of the token is stored.
create table if not exists quest_role_invites (
  id          uuid primary key default gen_random_uuid(),
  circle_id   uuid not null references quest_circles (id) on delete cascade,
  token_hash  text not null unique,
  role        text not null check (role in ('speaker', 'co_organiser', 'organiser')),
  max_uses    int not null check (max_uses between 1 and 50),
  uses        int not null default 0,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  note        text check (char_length(note) <= 120),
  created_by  uuid references quest_profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table quest_role_invites enable row level security;

-- Who used which invite link (one use per person per link).
create table if not exists quest_role_invite_uses (
  invite_id uuid not null references quest_role_invites (id) on delete cascade,
  user_id   uuid not null references quest_profiles (id) on delete cascade,
  at        timestamptz not null default now(),
  primary key (invite_id, user_id)
);
alter table quest_role_invite_uses enable row level security;

-- Invalid invite tokens tried, for rate limiting guesses.
create table if not exists quest_role_invite_misses (
  user_id uuid not null references quest_profiles (id) on delete cascade,
  at      timestamptz not null default now()
);
create index if not exists quest_role_invite_misses_idx on quest_role_invite_misses (user_id, at desc);
alter table quest_role_invite_misses enable row level security;

create table if not exists quest_role_changes (
  id         bigserial primary key,
  circle_id  uuid not null references quest_circles (id) on delete cascade,
  user_id    uuid not null references quest_profiles (id) on delete cascade,
  actor_id   uuid references quest_profiles (id) on delete set null,
  old_role   text not null,
  new_role   text not null,
  invite_id  uuid references quest_role_invites (id) on delete set null,
  at         timestamptz not null default now()
);
create index if not exists quest_role_changes_circle on quest_role_changes (circle_id, at desc);
alter table quest_role_changes enable row level security;

-- PadiUp accounts that may edit one partner's public profile.
create table if not exists quest_partner_managers (
  station_id uuid not null references quest_stations (id) on delete cascade,
  user_id    uuid not null references quest_profiles (id) on delete cascade,
  added_by   uuid references quest_profiles (id) on delete set null,
  added_at   timestamptz not null default now(),
  primary key (station_id, user_id)
);
alter table quest_partner_managers enable row level security;

alter table quest_stations
  add column if not exists updated_by uuid references quest_profiles (id) on delete set null,
  add column if not exists updated_at timestamptz;

-- Sees numbers across every circle (set by db/quest-07c-platform-admins.sql).
alter table quest_profiles add column if not exists is_platform_admin boolean not null default false;

-- Existing admins (active super admins and admins from the admin area) become organisers of
-- DevFest Jos 2026 when they have a PadiUp profile with the same email. Owners set in ADMIN_USERS
-- are organisers in code. Nobody is ever lowered by this.
insert into quest_circle_roles (circle_id, user_id, role)
select c.id, p.id, 'organiser'
from quest_circles c
join admin_users a on a.activated_at is not null and a.disabled_at is null and a.role in ('superadmin', 'admin')
join quest_profiles p on lower(p.email) = lower(a.email)
where c.slug = 'devfest-jos-2026'
on conflict (circle_id, user_id) do update set role = 'organiser';

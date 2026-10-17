-- Partner profiles on the existing partner stations (quest_stations, kind = 'booth').
-- Additive and safe to re-run. Apply BEFORE deploying the code that reads these columns.

alter table quest_stations
  add column if not exists slug        text,
  add column if not exists description text check (char_length(description) <= 280),
  add column if not exists website_url text check (website_url ~ '^https://'),
  add column if not exists logo_url    text check (logo_url ~ '^https://'),
  add column if not exists x           text,
  add column if not exists instagram   text,
  add column if not exists linkedin    text,
  add column if not exists facebook    text,
  add column if not exists github      text,
  add column if not exists youtube     text,
  add column if not exists sort_order  int not null default 0,
  add column if not exists active      boolean not null default true;

create unique index if not exists quest_stations_slug_key on quest_stations (slug);

-- Slugs for partners added before this migration: the name, URL-safe; a short id suffix on clashes.
with b as (
  select id, coalesce(nullif(trim(both '-' from lower(regexp_replace(name, '[^A-Za-z0-9]+', '-', 'g'))), ''), 'partner') as base
  from quest_stations where kind = 'booth' and slug is null
), n as (
  select id, base, row_number() over (partition by base order by id) as k from b
)
update quest_stations s
set slug = case when n.k = 1 and not exists (select 1 from quest_stations o where o.slug = n.base) then n.base
                else n.base || '-' || left(s.id::text, 4) end
from n where s.id = n.id;

-- When each player first opened each partner profile: online visit points need 8 seconds on the page.
create table if not exists quest_partner_views (
  user_id         uuid not null references quest_profiles (id) on delete cascade,
  station_id      uuid not null references quest_stations (id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  primary key (user_id, station_id)
);
alter table quest_partner_views enable row level security;

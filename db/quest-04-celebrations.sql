-- PadiUp event day, task 7: play the "new padi" celebration once per person per pair.
-- Additive and safe to re-run. Padis that already exist are marked as seen, so nobody
-- gets a burst of old celebrations.
create table if not exists quest_padi_seen (
  user_id  uuid not null references quest_profiles (id) on delete cascade,
  other_id uuid not null references quest_profiles (id) on delete cascade,
  at       timestamptz not null default now(),
  primary key (user_id, other_id)
);
alter table quest_padi_seen enable row level security;

insert into quest_padi_seen (user_id, other_id)
select user_a, user_b from quest_connections where status = 'accepted'
union
select user_b, user_a from quest_connections where status = 'accepted'
on conflict do nothing;

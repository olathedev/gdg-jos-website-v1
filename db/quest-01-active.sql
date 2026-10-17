-- PadiUp event day, task 2: "Active now" in People. Additive and safe to re-run.
alter table quest_profiles add column if not exists last_active_at timestamptz;
create index if not exists quest_profiles_last_active_idx on quest_profiles (last_active_at desc);

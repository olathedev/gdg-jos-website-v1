-- PadiUp event day, task 4: everyone is in People unless they choose to hide.
-- Additive and safe to re-run. Existing players default to visible.
alter table quest_profiles add column if not exists hidden boolean not null default false;

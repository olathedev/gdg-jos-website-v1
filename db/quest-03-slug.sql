-- PadiUp event day, task 6: shareable profile links (/p/<slug>). Additive and safe to re-run.
-- Slugs are created by the app the first time a player opens their profile.
alter table quest_profiles add column if not exists slug text;
create unique index if not exists quest_profiles_slug_idx on quest_profiles (slug);

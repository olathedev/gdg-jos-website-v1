-- Platform admins see the total sign-ups across every circle (Overview tab).
-- Replace the placeholders with real emails, then run. Safe to re-run.
-- Do not commit this file with real emails filled in.

update quest_profiles set is_platform_admin = true
where lower(email) in (lower('<platform admin email 1>'), lower('<platform admin email 2>'))
returning full_name;

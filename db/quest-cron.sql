-- Agent Mode background jobs, scheduled from Supabase (Vercel Hobby crons run only daily).
-- Not part of db:migrate. Run once in the Supabase SQL editor after:
--   1. Database → Extensions: enable pg_cron and pg_net.
--   2. Replace <SITE> with the live site URL and <CRON_SECRET> with the CRON_SECRET env value.

-- Every 15 minutes: find new #DevFestJos posts and check pasted links.
select cron.schedule('quest-x-sync', '*/15 * * * *', $$
  select net.http_get(
    url := '<SITE>/api/quest/cron?job=x',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'),
    timeout_milliseconds := 55000
  );
$$);

-- Daily at 03:00 WAT (02:00 UTC): deleted posts lose their points.
select cron.schedule('quest-x-recheck', '0 2 * * *', $$
  select net.http_get(
    url := '<SITE>/api/quest/cron?job=recheck',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'),
    timeout_milliseconds := 55000
  );
$$);

-- After 17 Oct: select cron.unschedule('quest-x-sync'); select cron.unschedule('quest-x-recheck');

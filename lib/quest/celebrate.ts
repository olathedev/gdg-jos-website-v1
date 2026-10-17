import "server-only";
import type postgres from "postgres";
import { db } from "@/lib/tickets/db";
import { displayName } from "./validate";

// The "new padi" celebration plays once per person per pair. Whoever makes the padi (scans,
// accepts, or asks someone who already asked them) sees it straight away and is marked here;
// the other person sees it the next time they open the app.

type Sql = postgres.Sql | postgres.TransactionSql;

export async function markPadiSeen(sql: Sql, userId: string, otherId: string) {
  await sql`insert into quest_padi_seen (user_id, other_id) values (${userId}, ${otherId}) on conflict do nothing`;
}

/** New padis this player hasn't celebrated yet (newest first). */
export async function unseenPadis(userId: string) {
  const rows = await db()<{ id: string; full_name: string }[]>`
    select p.id, p.full_name
    from quest_connections c
    join quest_profiles p on p.id = case when c.user_a = ${userId} then c.user_b else c.user_a end
    where (c.user_a = ${userId} or c.user_b = ${userId}) and c.status = 'accepted'
      and not exists (select 1 from quest_padi_seen s where s.user_id = ${userId} and s.other_id = p.id)
    order by c.responded_at desc nulls last
    limit 20`;
  return rows.map((r) => ({ id: r.id, name: displayName(r.full_name) }));
}

export async function markAllSeen(userId: string, otherIds: string[]) {
  if (!otherIds.length) return;
  await db()`
    insert into quest_padi_seen (user_id, other_id)
    select ${userId}, unnest(${otherIds}::uuid[])
    on conflict do nothing`;
}

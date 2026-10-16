import "server-only";
import type postgres from "postgres";
import { db } from "@/lib/tickets/db";
import { PRE_EVENT_CAP } from "./config";
import { phase } from "./time";
import { displayName, initials } from "./validate";

type Sql = postgres.Sql | postgres.TransactionSql;

/** Writes one ledger row. Returns false when that (user, source) was already paid. */
export async function award(sql: Sql, userId: string, sourceType: string, sourceId: string, points: number) {
  const rows = await sql`
    insert into quest_points (user_id, source_type, source_id, points)
    values (${userId}, ${sourceType}, ${sourceId}, ${points})
    on conflict (user_id, source_type, source_id) do nothing
    returning id`;
  return rows.length > 0;
}

export type BoardRow = {
  id: string;
  rank: number;
  name: string;
  initials: string;
  stack: string[];
  avatar: string | null;
  score: number;
};

type Board = { at: number; phase: string; rows: BoardRow[]; byId: Map<string, BoardRow> };
const cache = globalThis as unknown as { questBoard?: Board };
const BOARD_TTL = 30_000;

/**
 * Everyone with points, ranked. Before event day each score is capped; ties go to whoever
 * reached the score first. Cached for 30 seconds so 500 phones read one result.
 */
export async function leaderboard(): Promise<Board> {
  const p = phase();
  const hit = cache.questBoard;
  if (hit && hit.phase === p && Date.now() - hit.at < BOARD_TTL) return hit;

  const capped = p === "pre";
  const rows = await db()<{ id: string; full_name: string; is_adult: boolean; stack: string[]; avatar: string | null; score: number }[]>`
    with t as (
      select user_id, at, sum(points) over (partition by user_id order by at, id) as cum
      from quest_points
    ),
    s as (
      select user_id,
             case when ${capped} then least(max(cum), ${PRE_EVENT_CAP}) else max(cum) end as score
      from t group by user_id
    )
    select p.id, p.full_name, p.is_adult, p.stack, p.avatar, s.score::int as score
    from s
    join quest_profiles p on p.id = s.user_id
    where s.score > 0
    order by s.score desc,
             (select min(t.at) from t where t.user_id = s.user_id and t.cum >= s.score) asc`;

  const list: BoardRow[] = rows.map((r, i) => ({
    id: r.id,
    rank: i + 1,
    name: displayName(r.full_name, r.is_adult),
    initials: initials(r.is_adult ? r.full_name : displayName(r.full_name, false)),
    stack: r.stack,
    avatar: r.avatar,
    score: r.score,
  }));
  const board = { at: Date.now(), phase: p, rows: list, byId: new Map(list.map((r) => [r.id, r])) };
  cache.questBoard = board;
  return board;
}

/** Drop the cached board so a player sees their own new points straight away. */
export const invalidateBoard = () => {
  cache.questBoard = undefined;
};

/** A player's live score (uncached) and their total including points held over the cap. */
export async function myScore(userId: string) {
  const [{ total }] = await db()<{ total: number }[]>`
    select coalesce(sum(points), 0)::int as total from quest_points where user_id = ${userId}`;
  const score = phase() === "pre" ? Math.min(total, PRE_EVENT_CAP) : total;
  return { score, total };
}

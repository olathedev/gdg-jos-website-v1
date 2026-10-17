import "server-only";
import { ownerEmails } from "@/lib/admin/auth";
import { db } from "@/lib/tickets/db";
import type { Circle } from "./circles";
import type { Role } from "./roles";
import { displayName, initials } from "./validate";

// Circle admin data: numbers for the Overview tab and the full member list for People.
// Membership is implicit, so a circle's members are all PadiUp profiles. Never returns emails.

const COMPLETE = `(trim(p.full_name) <> '' and cardinality(p.stack) >= 1
  and (p.github is not null or p.linkedin is not null or p.x_handle is not null or p.instagram is not null))`;

export type CircleStats = {
  members: number;
  joinedToday: number;
  complete: number;
  activeNow: number;
  activeToday: number;
  connections: number;
  points: number;
  byHour: number[];
  platformTotal: number;
};

const cache = globalThis as unknown as { circleStats?: Map<string, { at: number; stats: CircleStats }> };

/** Counted on the server, cached 60 seconds per circle. */
export async function circleStats(circle: Circle): Promise<CircleStats> {
  cache.circleStats ??= new Map();
  const hit = cache.circleStats.get(circle.id);
  if (hit && Date.now() - hit.at < 60_000) return hit.stats;
  const sql = db();
  const [[s], hours] = await Promise.all([
    sql<Omit<CircleStats, "byHour">[]>`
      select
        count(*)::int as members,
        count(*) filter (where (p.created_at at time zone 'Africa/Lagos')::date = (now() at time zone 'Africa/Lagos')::date)::int as "joinedToday",
        count(*) filter (where ${sql.unsafe(COMPLETE)})::int as complete,
        count(*) filter (where p.last_active_at > now() - interval '15 minutes')::int as "activeNow",
        count(*) filter (where (p.last_active_at at time zone 'Africa/Lagos')::date = (now() at time zone 'Africa/Lagos')::date)::int as "activeToday",
        (select count(*)::int from quest_connections where status = 'accepted') as connections,
        (select coalesce(sum(points), 0)::int from quest_points) as points,
        count(*)::int as "platformTotal"
      from quest_profiles p`,
    sql<{ h: number; n: number }[]>`
      select extract(hour from p.created_at at time zone 'Africa/Lagos')::int as h, count(*)::int as n
      from quest_profiles p
      where (p.created_at at time zone 'Africa/Lagos')::date = (now() at time zone 'Africa/Lagos')::date
      group by 1`,
  ]);
  const byHour = Array.from({ length: 24 }, (_, h) => hours.find((r) => r.h === h)?.n ?? 0);
  const stats = { ...s, byHour };
  cache.circleStats.set(circle.id, { at: Date.now(), stats });
  return stats;
}

export type MemberRow = {
  id: string;
  minor: boolean;
  name: string;
  initials: string;
  avatar: string | null;
  joined: string;
  role: Role;
  complete: boolean;
  points: number;
  lastActive: string | null;
  hasPhoto: boolean;
};

export type MemberQuery = { q: string; role: Role | "all"; complete: "all" | "yes" | "no"; sort: "joined" | "points" | "active"; page: number };
export const PAGE_SIZE = 50;

/** One page of members, with the total matching. Under-18s are listed without name or photo. */
export async function members(circle: Circle, f: MemberQuery) {
  const sql = db();
  const owners = ownerEmails();
  const q = f.q.trim().slice(0, 60);
  const like = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  const order =
    f.sort === "points" ? sql`points desc, p.created_at desc` : f.sort === "active" ? sql`p.last_active_at desc nulls last` : sql`p.created_at desc`;
  const rows = await sql<
    { id: string; is_adult: boolean; full_name: string; avatar: string | null; created_at: Date; role: Role; complete: boolean; points: number; last_active_at: Date | null; total: number }[]
  >`
    with m as (
      select p.id, p.is_adult, p.full_name, p.avatar, p.created_at, p.last_active_at,
             case when lower(p.email) = any(${owners}) then 'organiser' else coalesce(r.role, 'attendee') end as role,
             ${sql.unsafe(COMPLETE)} as complete,
             coalesce((select sum(points) from quest_points q where q.user_id = p.id), 0)::int as points
      from quest_profiles p
      left join quest_circle_roles r on r.circle_id = ${circle.id} and r.user_id = p.id
    )
    select p.*, count(*) over ()::int as total from m p
    where (${q === ""} or (p.is_adult and p.full_name ilike ${like}))
      and (${f.role === "all"} or p.role = ${f.role})
      and (${f.complete === "all"} or p.complete = ${f.complete === "yes"})
    order by ${order}
    limit ${PAGE_SIZE} offset ${(f.page - 1) * PAGE_SIZE}`;
  const list: MemberRow[] = rows.map((r) => ({
    id: r.id,
    minor: !r.is_adult,
    name: r.is_adult ? displayName(r.full_name) : "Under-18 member",
    initials: r.is_adult ? initials(r.full_name) : "U",
    avatar: r.is_adult ? r.avatar : null,
    joined: r.created_at.toISOString(),
    role: r.role,
    complete: r.complete,
    points: r.points,
    lastActive: r.last_active_at ? r.last_active_at.toISOString() : null,
    hasPhoto: Boolean(r.avatar?.startsWith("https://")),
  }));
  return { list, total: rows[0]?.total ?? 0 };
}

/** Latest role changes, newest first. */
export async function roleHistory(circle: Circle, limit = 30) {
  const rows = await db()<
    { id: number; at: Date; old_role: string; new_role: string; via_link: boolean; t_name: string; t_adult: boolean; a_name: string | null; a_adult: boolean | null }[]
  >`
    select c.id, c.at, c.old_role, c.new_role, c.invite_id is not null as via_link,
           t.full_name as t_name, t.is_adult as t_adult, a.full_name as a_name, a.is_adult as a_adult
    from quest_role_changes c
    join quest_profiles t on t.id = c.user_id
    left join quest_profiles a on a.id = c.actor_id
    where c.circle_id = ${circle.id}
    order by c.at desc limit ${limit}`;
  return rows.map((r) => ({
    id: r.id,
    at: r.at.toISOString(),
    oldRole: r.old_role,
    newRole: r.new_role,
    viaLink: r.via_link,
    target: r.t_adult ? displayName(r.t_name) : "Under-18 member",
    actor: r.a_name ? (r.a_adult ? displayName(r.a_name) : "Under-18 member") : "Unknown",
  }));
}

/** Organisers and co-organisers can take down a member's uploaded photo; they go back to initials. */
export async function removePhoto(userId: string) {
  const rows = await db()`update quest_profiles set avatar = 'none' where id = ${userId} and avatar like 'https://%' returning id`;
  return rows.length > 0;
}

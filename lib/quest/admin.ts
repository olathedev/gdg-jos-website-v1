import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/tickets/db";
import { POINTS } from "./config";
import { award, invalidateBoard } from "./points";
import { displayName } from "./validate";

// Organiser tools for DevFest Quest (admin area only).

/**
 * GDG Community has no API: organisers export the GDG Jos member list as CSV and upload it.
 * Every "joined" claim whose sign-in email is in the file is matched and paid.
 */
export async function matchCommunityMembers(fileText: string) {
  const emails = [...new Set((fileText.match(/[^\s,;"'<>]+@[^\s,;"'<>]+\.[A-Za-z]{2,}/g) ?? []).map((e) => e.toLowerCase()))];
  if (!emails.length) return { emails: 0, matched: 0 };
  const sql = db();
  const rows = await sql<{ user_id: string }[]>`
    update quest_social_claims c set status = 'matched'
    from quest_profiles p
    where c.user_id = p.id and c.platform = 'community' and c.status = 'claimed'
      and lower(p.email) = any(${emails})
    returning c.user_id`;
  for (const r of rows) await award(sql, r.user_id, "community", "gdg-community", POINTS.community);
  if (rows.length) invalidateBoard();
  return { emails: emails.length, matched: rows.length };
}

export async function questStats() {
  const [s] = await db()<
    { players: number; listed: number; claims: number; matched: number; xPending: number; xCounted: number; openReports: number; checkedIn: number }[]
  >`
    select
      (select count(*)::int from quest_profiles where onboarded_at is not null) as players,
      (select count(*)::int from quest_profiles where listed) as listed,
      (select count(*)::int from quest_social_claims where platform = 'community' and status = 'claimed') as claims,
      (select count(*)::int from quest_social_claims where platform = 'community' and status = 'matched') as matched,
      (select count(*)::int from quest_x_posts where status = 'pending') as "xPending",
      (select count(*)::int from quest_x_posts where status = 'counted') as "xCounted",
      (select count(*)::int from quest_blocks where reported and status = 'open') as "openReports",
      (select count(*)::int from quest_checkins) as "checkedIn"`;
  return s;
}

export type Report = {
  blocker: string;
  blocked: string;
  reporterName: string;
  reporterEmail: string;
  reportedName: string;
  reportedEmail: string;
  reason: string | null;
  status: string;
  created_at: Date;
};

export async function listReports() {
  const rows = await db()<(Omit<Report, "reporterName" | "reportedName"> & { a_name: string; b_name: string })[]>`
    select b.blocker, b.blocked, b.reason, b.status, b.created_at,
           a.full_name as a_name, a.email as "reporterEmail", o.full_name as b_name, o.email as "reportedEmail"
    from quest_blocks b
    join quest_profiles a on a.id = b.blocker
    join quest_profiles o on o.id = b.blocked
    where b.reported
    order by (b.status = 'open') desc, b.created_at desc
    limit 200`;
  return rows.map<Report>(({ a_name, b_name, ...r }) => ({ ...r, reporterName: displayName(a_name), reportedName: displayName(b_name) }));
}

export async function markReportReviewed(blocker: string, blocked: string) {
  await db()`update quest_blocks set status = 'reviewed' where blocker = ${blocker} and blocked = ${blocked} and reported`;
}

/* ---------- stage game: quiz rounds and partners ---------- */

export async function listRounds() {
  return db()<{ round: number; opened_at: Date | null; closed_at: Date | null; plays: number; questions: number }[]>`
    select r.round, r.opened_at, r.closed_at,
           (select count(*)::int from quest_round_plays p where p.round = r.round) as plays,
           (select count(*)::int from quest_quiz_items i where i.quiz_round = r.round) as questions
    from quest_rounds r order by r.round`;
}

/** open: starts now (reopening clears the close). close: ends now. */
export async function setRound(round: number, op: "open" | "close") {
  if (op === "open") await db()`update quest_rounds set opened_at = coalesce(opened_at, now()), closed_at = null where round = ${round}`;
  else await db()`update quest_rounds set closed_at = now() where round = ${round} and opened_at is not null`;
}

/** Partner Link-up is closed for everyone until an organiser opens it. */
export async function partnersOpen() {
  const [row] = await db()<{ value: string }[]>`select value from quest_meta where key = 'partners_open'`;
  return row?.value === "1";
}

export async function setPartnersOpen(open: boolean) {
  await db()`
    insert into quest_meta (key, value, updated_at) values ('partners_open', ${open ? "1" : "0"}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}

export async function listPartners() {
  return db()<{ id: string; name: string; code: string; scans: number }[]>`
    select s.id, s.name, s.code, (select count(*)::int from quest_station_scans x where x.station_id = s.id) as scans
    from quest_stations s where s.kind = 'booth' order by s.name`;
}

export async function addPartner(name: string) {
  const code = `p-${randomBytes(6).toString("base64url")}`;
  await db()`insert into quest_stations (kind, name, code) values ('booth', ${name}, ${code})`;
}

/** Only partners nobody has scanned yet can be removed, so nobody loses points. */
export async function removePartner(id: string) {
  const rows = await db()`
    delete from quest_stations s where s.id = ${id} and s.kind = 'booth'
      and not exists (select 1 from quest_station_scans x where x.station_id = s.id)
    returning id`;
  return rows.length > 0;
}

export type RoundQuestion = { id: string; question: string; options: string[]; correct: number; answers: number };

export async function listRoundQuestions() {
  const rows = await db()<(RoundQuestion & { quiz_round: number })[]>`
    select i.id, i.question, i.options, i.correct, i.quiz_round,
           (select count(*)::int from quest_round_answers a where a.item_id = i.id) as answers
    from quest_quiz_items i where i.quiz_round is not null
    order by i.quiz_round, i.sort, i.slug`;
  const by: Record<number, RoundQuestion[]> = { 1: [], 2: [], 3: [] };
  for (const { quiz_round, ...q } of rows) by[quiz_round]?.push(q);
  return by;
}

/** A custom question for a Brain Blitz round, e.g. from a talk that just ended. */
export async function addRoundQuestion(round: number, question: string, options: string[], correct: number) {
  const slug = `custom-${randomBytes(5).toString("hex")}`;
  await db()`
    insert into quest_quiz_items (slug, round, track, learn, question, options, correct, explanation, sort, quiz_round)
    values (${slug}, 'anytime', 'Talks', ${question}, ${question}, ${JSON.stringify(options)}::jsonb, ${correct}, '', 100, ${round})`;
}

/** Takes a question out of its round. Nothing is deleted, so answers and points already given stay. */
export async function unassignRoundQuestion(id: string) {
  await db()`update quest_quiz_items set quiz_round = null where id = ${id}`;
}

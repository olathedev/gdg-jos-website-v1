import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/tickets/db";
import {
  FOLLOWS,
  LIMITS,
  PARTNER_GOAL,
  PARTNER_UNLOCK_PADIS,
  POINTS,
  ROUND_QUESTIONS,
  ROUND_SECONDS,
  SQUAD_GOAL,
  SQUAD_RETRY_SECONDS,
  STACK_LABELS,
  type StageId,
} from "./config";
import { agentByToken, GameError, type Profile } from "./game";
import { award, invalidateBoard } from "./points";
import { displayName } from "./validate";

// The 4-stage game. Socials and Padi Up are always open; Brain Blitz and Partners unlock once
// you've connected with SQUAD_GOAL people. Brain Blitz runs in rounds organisers open.

export type StageState = "locked" | "open" | "live" | "done";

export type RoundInfo = {
  round: number;
  status: "soon" | "live" | "closed";
  played: boolean;
  finished: boolean;
  score: number;
};

export async function gameState(userId: string) {
  const sql = db();
  const [[n], rounds] = await Promise.all([
    sql<{ follows: number; squad: number; padis: number; partners: number; open: boolean }[]>`
      select
        (select count(*)::int from quest_social_claims
          where user_id = ${userId} and platform = any(${FOLLOWS.map((f) => f.id)})) as follows,
        (select count(*)::int from quest_meets where user_a = ${userId} or user_b = ${userId}) as squad,
        (select count(*)::int from quest_connections
          where (user_a = ${userId} or user_b = ${userId}) and status = 'accepted') as padis,
        (select count(*)::int from quest_station_scans x join quest_stations s on s.id = x.station_id
          where x.user_id = ${userId} and s.kind = 'booth') as partners,
        exists (select 1 from quest_meta where key = 'partners_open' and value = '1') as open`,
    sql<{ round: number; opened: boolean; closed: boolean; started: boolean; finished: boolean; score: number }[]>`
      select r.round,
             (r.opened_at is not null and r.opened_at <= now()) as opened,
             (r.closed_at is not null and r.closed_at <= now()) as closed,
             (p.started_at is not null) as started,
             (p.finished_at is not null or p.started_at < now() - make_interval(secs => ${ROUND_SECONDS})) as finished,
             coalesce(p.score, 0) as score
      from quest_rounds r
      left join quest_round_plays p on p.round = r.round and p.user_id = ${userId}
      order by r.round`,
  ]);

  const roundInfo: RoundInfo[] = rounds.map((r) => ({
    round: r.round,
    status: !r.opened ? "soon" : r.closed ? "closed" : "live",
    played: r.started,
    finished: Boolean(r.finished),
    score: r.score,
  }));

  const socialsDone = n.follows >= FOLLOWS.length;
  const squadDone = n.squad >= SQUAD_GOAL;
  const liveUnplayed = roundInfo.some((r) => r.status === "live" && !r.played);
  const quizDone = roundInfo.every((r) => r.played || r.status === "closed") && roundInfo.some((r) => r.played);
  const partnersDone = n.partners >= PARTNER_GOAL;

  const states: Record<StageId, StageState> = {
    socials: socialsDone ? "done" : "open",
    // Scanning people is never locked: it's the heart of the event.
    padiup: squadDone ? "done" : "open",
    quiz: !squadDone ? "locked" : liveUnplayed ? "live" : quizDone ? "done" : "open",
    // Partners waits for real connections: PARTNER_UNLOCK_PADIS accepted padis.
    partners: partnersDone ? "done" : !n.open || n.padis < PARTNER_UNLOCK_PADIS ? "locked" : "open",
  };
  const order: StageId[] = ["socials", "padiup", "quiz", "partners"];
  const current = order.find((id) => states[id] === "live") ?? order.find((id) => states[id] === "open") ?? "partners";

  return {
    states,
    current,
    counts: { follows: n.follows, squad: n.squad, padis: n.padis, partners: n.partners },
    partnersOpen: n.open,
    rounds: roundInfo,
  };
}

export async function requireStage(userId: string, stage: StageId) {
  const s = await gameState(userId);
  if (s.states[stage] === "locked") {
    throw new GameError(
      stage === "partners"
        ? s.partnersOpen
          ? `Get ${PARTNER_UNLOCK_PADIS} padis to unlock Partner Link-up.`
          : "Partner Link-up isn't open yet. Organisers will announce it."
        : "Scan 3 people in Padi Up first to unlock this stage.",
      "locked",
    );
  }
  return s;
}

/* ---------- Padi Up ---------- */

/** Everyone you've connected with by scanning, newest first. */
export async function squadList(userId: string) {
  const rows = await db()<{ id: string; full_name: string; is_adult: boolean; avatar: string | null; stack: string[] }[]>`
    select p.id, p.full_name, p.is_adult, p.avatar, p.stack
    from quest_meets m
    join quest_profiles p on p.id = case when m.user_a = ${userId} then m.user_b else m.user_a end
    where m.user_a = ${userId} or m.user_b = ${userId}
    order by m.at desc`;
  return rows.map((r) => ({ id: r.id, name: displayName(r.full_name, r.is_adult), avatar: r.avatar, stack: r.stack }));
}

/* ---------- Brain Blitz ---------- */

type Play = { started_at: Date; finished_at: Date | null; score: number };

async function roundLive(round: number) {
  const [r] = await db()<{ live: boolean }[]>`
    select (opened_at is not null and opened_at <= now() and (closed_at is null or closed_at > now())) as live
    from quest_rounds where round = ${round}`;
  return Boolean(r?.live);
}

const deadline = (p: Play) => p.started_at.getTime() + ROUND_SECONDS * 1000;

async function roundItems(userId: string, round: number) {
  return db()<{ id: string; question: string; options: string[]; correct: number; answered: number | null }[]>`
    select i.id, i.question, i.options, i.correct, a.choice as answered
    from quest_quiz_items i
    left join quest_round_answers a on a.item_id = i.id and a.user_id = ${userId}
    where i.quiz_round = ${round}
    order by md5(i.id::text || ${userId})
    limit ${ROUND_QUESTIONS}`;
}

export type RoundView =
  | { kind: "soon" | "closed" | "locked" }
  | { kind: "ready" }
  | {
      kind: "playing";
      deadline: number;
      questions: { id: string; question: string; options: string[] }[];
      answered: number;
      score: number;
    }
  | { kind: "result"; score: number; total: number; rank: number | null; seconds: number };

async function result(userId: string, round: number, total: number): Promise<RoundView> {
  const [r] = await db()<{ score: number; seconds: number; rank: number }[]>`
    with t as (
      select user_id, score,
             extract(epoch from coalesce(finished_at, started_at + make_interval(secs => ${ROUND_SECONDS})) - started_at) as secs
      from quest_round_plays where round = ${round}
    )
    select score, round(secs)::int as seconds,
           (select count(*)::int + 1 from t o where o.score > t.score or (o.score = t.score and o.secs < t.secs)) as rank
    from t where user_id = ${userId}`;
  return { kind: "result", score: r?.score ?? 0, total, rank: r?.rank ?? null, seconds: Math.min(r?.seconds ?? ROUND_SECONDS, ROUND_SECONDS) };
}

export async function roundView(userId: string, round: number): Promise<RoundView> {
  const s = await gameState(userId);
  if (s.states.quiz === "locked") return { kind: "locked" };
  const info = s.rounds.find((r) => r.round === round);
  if (!info) return { kind: "soon" };
  if (info.played) {
    const [play] = await db()<Play[]>`select started_at, finished_at, score from quest_round_plays where user_id = ${userId} and round = ${round}`;
    const items = await roundItems(userId, round);
    if (play.finished_at || Date.now() > deadline(play) || items.every((i) => i.answered !== null)) {
      return result(userId, round, items.length);
    }
    return {
      kind: "playing",
      deadline: deadline(play),
      questions: items.filter((i) => i.answered === null).map(({ id, question, options }) => ({ id, question, options })),
      answered: items.filter((i) => i.answered !== null).length,
      score: play.score,
    };
  }
  return info.status === "live" ? { kind: "ready" } : { kind: info.status === "soon" ? "soon" : "closed" };
}

export async function startRound(userId: string, round: number) {
  await requireStage(userId, "quiz");
  if (!(await roundLive(round))) throw new GameError("This round isn't open.");
  await db()`insert into quest_round_plays (user_id, round) values (${userId}, ${round}) on conflict do nothing`;
  return roundView(userId, round);
}

export async function answerRound(userId: string, round: number, itemId: string, choice: number) {
  const sql = db();
  const [play] = await sql<Play[]>`select started_at, finished_at, score from quest_round_plays where user_id = ${userId} and round = ${round}`;
  if (!play) throw new GameError("Start the round first.");
  if (play.finished_at || Date.now() > deadline(play) + 2000) throw new GameError("Time's up.", "timeup");
  const items = await roundItems(userId, round);
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new GameError("That question isn't in this round.");
  if (!Number.isInteger(choice) || choice < 0 || choice >= item.options.length) throw new GameError("Pick an answer.");
  const correct = item.correct === choice;
  const inserted = await sql`
    insert into quest_round_answers (user_id, item_id, round, choice, correct)
    values (${userId}, ${itemId}, ${round}, ${choice}, ${correct})
    on conflict do nothing returning item_id`;
  if (inserted.length && correct) {
    await sql`update quest_round_plays set score = score + 1 where user_id = ${userId} and round = ${round}`;
    if (await award(sql, userId, "round", itemId, POINTS.roundAnswer)) invalidateBoard();
  }
  const left = items.filter((i) => i.answered === null && i.id !== itemId).length;
  if (!left) await finishRound(userId, round);
  return { correct, correctIndex: item.correct };
}

export async function finishRound(userId: string, round: number) {
  await db()`
    update quest_round_plays
    set finished_at = least(now(), started_at + make_interval(secs => ${ROUND_SECONDS}))
    where user_id = ${userId} and round = ${round} and finished_at is null`;
}

export async function roundBoard(round: number, limit = 10) {
  const rows = await db()<{ id: string; full_name: string; is_adult: boolean; avatar: string | null; score: number; secs: number }[]>`
    select p.id, p.full_name, p.is_adult, p.avatar, r.score,
           round(extract(epoch from coalesce(r.finished_at, r.started_at + make_interval(secs => ${ROUND_SECONDS})) - r.started_at))::int as secs
    from quest_round_plays r join quest_profiles p on p.id = r.user_id
    where r.round = ${round}
    order by r.score desc, 6 asc
    limit ${limit}`;
  return rows.map((r, i) => ({
    rank: i + 1,
    id: r.id,
    name: displayName(r.full_name, r.is_adult),
    avatar: r.avatar,
    score: r.score,
    seconds: Math.min(r.secs, ROUND_SECONDS),
  }));
}

/* ---------- Partner Link-up ---------- */

export async function partners(userId: string) {
  return db()<{ id: string; name: string; visited: boolean }[]>`
    select s.id, s.name, exists (select 1 from quest_station_scans x where x.station_id = s.id and x.user_id = ${userId}) as visited
    from quest_stations s where s.kind = 'booth'
    order by s.name`;
}

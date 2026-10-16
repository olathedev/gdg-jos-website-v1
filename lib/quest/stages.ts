import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/tickets/db";
import {
  FOLLOWS,
  LIMITS,
  PARTNER_GOAL,
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

// The 4-stage game. Stages unlock in order: Socials → Squad Up → Brain Blitz → Partners.
// Brain Blitz runs in rounds that organisers open, so Partners unlocks with it once Squad Up
// is cleared; nobody gets stuck waiting for a round.

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
    sql<{ follows: number; squad: number; partners: number }[]>`
      select
        (select count(*)::int from quest_social_claims
          where user_id = ${userId} and platform = any(${FOLLOWS.map((f) => f.id)})) as follows,
        (select count(*)::int from quest_lockins where user_id = ${userId}) as squad,
        (select count(*)::int from quest_station_scans x join quest_stations s on s.id = x.station_id
          where x.user_id = ${userId} and s.kind = 'booth') as partners`,
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
    squad: !socialsDone ? "locked" : squadDone ? "done" : "open",
    quiz: !squadDone ? "locked" : liveUnplayed ? "live" : quizDone ? "done" : "open",
    partners: !squadDone ? "locked" : partnersDone ? "done" : "open",
  };
  const order: StageId[] = ["socials", "squad", "quiz", "partners"];
  const current = order.find((id) => states[id] === "live") ?? order.find((id) => states[id] === "open") ?? "partners";

  return {
    states,
    current,
    counts: { follows: n.follows, squad: n.squad, partners: n.partners },
    rounds: roundInfo,
  };
}

export async function requireStage(userId: string, stage: StageId) {
  const s = await gameState(userId);
  if (s.states[stage] === "locked") {
    throw new GameError(
      stage === "squad" ? "Finish Follow the Signal first to unlock Squad Up." : "Lock in your squad first to unlock this stage.",
      "locked",
    );
  }
  return s;
}

/* ---------- Squad Up ---------- */

const seeded = (seed: string) => {
  let i = 0;
  return () => {
    const h = createHash("sha256").update(`${seed}:${i++}`).digest();
    return h.readUInt32BE(0) / 0x1_0000_0000;
  };
};

function shuffle<T>(items: T[], rand: () => number) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK_NAMES = ["Ada O.", "Tunde B.", "Zainab M.", "Chidi E.", "Ngozi A.", "Musa D.", "Kemi S.", "Ibrahim Y."];
const FALLBACK_FACTS = [
  "I have never missed a DevFest",
  "I can solve a Rubik's cube in under a minute",
  "I once built an app in one night",
  "I speak four languages",
  "I've climbed Shere Hills twice",
  "I make the best jollof in my street",
  "I learnt to code on my phone",
  "I collect old keyboards",
];

function pickDistinct(pool: string[], fallback: string[], exclude: string, rand: () => number, n = 3) {
  const seen = new Set([exclude.toLowerCase()]);
  const out: string[] = [];
  for (const v of [...shuffle(pool, rand), ...shuffle(fallback, rand)]) {
    const k = v.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(v);
    if (out.length === n) break;
  }
  return out;
}

export type SquadQuestion = { key: "name" | "stack" | "fact"; prompt: string; options: string[] };

/**
 * Three questions about the person whose QR you scanned. Options stay the same for this pair
 * every time, and answers are checked as text, so new sign-ups never change the right answer.
 */
async function squadQuestions(me: Profile, target: Profile): Promise<SquadQuestion[]> {
  const rand = seeded(`${me.id}:${target.id}`);
  const others = await db()<{ full_name: string; is_adult: boolean; fun_fact: string | null }[]>`
    select full_name, is_adult, fun_fact from quest_profiles
    where onboarded_at is not null and id <> ${me.id} and id <> ${target.id}
    order by md5(id::text || ${me.id} || ${target.id})
    limit 12`;
  const name = displayName(target.full_name, target.is_adult);
  const stackAnswer = target.stack.length ? target.stack[Math.floor(rand() * target.stack.length)] : "Just exploring";
  const fact = target.fun_fact ?? "";

  const names = pickDistinct(
    others.map((o) => displayName(o.full_name, o.is_adult)),
    FALLBACK_NAMES,
    name,
    rand,
  );
  const stacks = shuffle(
    STACK_LABELS.filter((s) => !target.stack.includes(s)),
    rand,
  ).slice(0, 3);
  const facts = pickDistinct(
    others.map((o) => o.fun_fact ?? "").filter(Boolean),
    FALLBACK_FACTS,
    fact,
    rand,
  );

  return [
    { key: "name", prompt: "What's their name?", options: shuffle([name, ...names], rand) },
    { key: "stack", prompt: "Which of these is in their stack?", options: shuffle([stackAnswer, ...stacks], rand) },
    { key: "fact", prompt: "What's their fun fact?", options: shuffle([fact, ...facts], rand) },
  ];
}

export type SquadView =
  | { kind: "self" }
  | { kind: "locked"; message: string }
  | { kind: "done" }
  | { kind: "blocked" }
  | { kind: "play"; questions: SquadQuestion[]; retryIn: number };

async function lockinStatus(me: Profile, target: Profile) {
  const sql = db();
  const [row] = await sql<{ done: boolean; blocked: boolean; retry: number }[]>`
    select
      exists (select 1 from quest_lockins where user_id = ${me.id} and target_id = ${target.id}) as done,
      exists (select 1 from quest_blocks
        where (blocker = ${me.id} and blocked = ${target.id}) or (blocker = ${target.id} and blocked = ${me.id})) as blocked,
      coalesce((select greatest(0, ceil(${SQUAD_RETRY_SECONDS} - extract(epoch from now() - max(at))))::int
        from quest_lockin_misses where user_id = ${me.id} and target_id = ${target.id}), 0) as retry`;
  return row;
}

export async function squadView(me: Profile, target: Profile): Promise<SquadView> {
  if (target.id === me.id) return { kind: "self" };
  const s = await gameState(me.id);
  if (s.states.squad === "locked") {
    return { kind: "locked", message: "Finish Stage 1, Follow the Signal, to unlock Squad Up. Then scan this code again." };
  }
  if (!target.fun_fact) return { kind: "locked", message: "This player hasn't finished their card yet. Ask them to add a fun fact, then scan again." };
  const st = await lockinStatus(me, target);
  if (st.blocked) return { kind: "blocked" };
  if (st.done) return { kind: "done" };
  return { kind: "play", questions: await squadQuestions(me, target), retryIn: st.retry };
}

export async function lockIn(me: Profile, token: string, answers: { name: string; stack: string; fact: string }) {
  const target = await agentByToken(token);
  if (!target) throw new GameError("That QR isn't a DevFest Quest code.");
  if (target.id === me.id) throw new GameError("That's your own code. Scan someone else's.");
  await requireStage(me.id, "squad");
  const full = target;
  const st = await lockinStatus(me, full);
  if (st.blocked) throw new GameError("You can't lock in this player.");
  if (st.done) return { fresh: false, name: displayName(full.full_name, full.is_adult) };
  if (st.retry > 0) throw new GameError(`Talk to them a bit more. Try again in ${st.retry}s.`, "cooldown");

  const sql = db();
  const [{ recent }] = await sql<{ recent: number }[]>`
    select count(*)::int as recent from quest_lockins where user_id = ${me.id} and at > now() - interval '1 hour'`;
  if (recent >= LIMITS.meetsPerHour) throw new GameError("Slow down. Try again in a few minutes.");

  const name = displayName(full.full_name, full.is_adult);
  const ok =
    answers.name === name &&
    full.stack.includes(answers.stack) &&
    (full.fun_fact ?? "").trim().length > 0 &&
    answers.fact === full.fun_fact;
  if (!ok) {
    await sql`insert into quest_lockin_misses (user_id, target_id) values (${me.id}, ${full.id})`;
    throw new GameError(`Not quite. At least one answer is wrong. Ask them, then try again in ${SQUAD_RETRY_SECONDS}s.`, "miss");
  }

  const rows = await sql`
    insert into quest_lockins (user_id, target_id) values (${me.id}, ${full.id})
    on conflict do nothing returning user_id`;
  if (rows.length && (await award(sql, me.id, "lockin", full.id, POINTS.meet))) invalidateBoard();
  return { fresh: rows.length > 0, name };
}

export async function squadList(userId: string) {
  const rows = await db()<{ id: string; full_name: string; is_adult: boolean; avatar: string | null; stack: string[] }[]>`
    select p.id, p.full_name, p.is_adult, p.avatar, p.stack
    from quest_lockins l join quest_profiles p on p.id = l.target_id
    where l.user_id = ${userId}
    order by l.at desc`;
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

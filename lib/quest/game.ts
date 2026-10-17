import "server-only";
import { db } from "@/lib/tickets/db";
import { FOLLOWS, LIMITS, POINTS } from "./config";
import { markPadiSeen } from "./celebrate";
import { award, invalidateBoard } from "./points";
import type { StaffRole } from "./roles";
import { randomToken } from "./session";
import { eventDate, lagosToday, phase } from "./time";
import { displayName, initials, links, type PlayerInput, type ProfileInput } from "./validate";

// Every game rule lives here, on the server. Browsers send choices; this decides.

export class GameError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  stack: string[];
  github: string | null;
  linkedin: string | null;
  x_handle: string | null;
  instagram: string | null;
  whatsapp: string | null;
  is_adult: boolean;
  listed: boolean;
  share_whatsapp: boolean;
  quest_token: string;
  invite_code: string;
  onboarded_at: Date | null;
  last_active_at?: Date | null;
  hidden: boolean;
  slug: string | null;
  avatar: string | null;
  fun_fact: string | null;
};

const order = (a: string, b: string) => (a < b ? [a, b] : [b, a]);

/* ---------- profiles ---------- */

export async function getProfile(id: string) {
  const [p] = await db()<Profile[]>`
    select id, email, full_name, stack, github, linkedin, x_handle, instagram, whatsapp,
           is_adult, listed, share_whatsapp, quest_token, invite_code, onboarded_at, avatar, fun_fact, hidden, slug
    from quest_profiles where id = ${id}`;
  return p ?? null;
}

/** Find or create the profile for a signed-in Supabase Auth user. */
export async function upsertAuthUser(authId: string, email: string, name: string, inviteCode: string | null) {
  const sql = db();
  const [inviter] = inviteCode
    ? await sql<{ id: string }[]>`select id from quest_profiles where invite_code = ${inviteCode}`
    : [];
  const [row] = await sql<{ id: string }[]>`
    insert into quest_profiles (auth_id, email, full_name, quest_token, invite_code, invited_by)
    values (${authId}, ${email}, ${name.slice(0, 60)}, ${randomToken(18)}, ${randomToken(6)}, ${inviter?.id ?? null})
    on conflict (auth_id) do update set email = excluded.email
    returning id`;
  return row.id;
}

export async function saveProfile(userId: string, input: ProfileInput) {
  const sql = db();
  const adult = input.is_adult;
  try {
    const [row] = await sql`
      update quest_profiles set
        full_name = ${input.full_name},
        stack = ${input.stack},
        github = ${input.github},
        linkedin = ${input.linkedin},
        x_handle = ${input.x_handle},
        x_handle_at = case when x_handle is distinct from ${input.x_handle} then now() else x_handle_at end,
        instagram = ${input.instagram},
        whatsapp = ${input.whatsapp},
        is_adult = ${adult},
        listed = ${adult && input.listed},
        share_whatsapp = ${adult && input.share_whatsapp && Boolean(input.whatsapp)},
        onboarded_at = coalesce(onboarded_at, now())
      where id = ${userId}
      returning id`;
    if (!row) throw new GameError("Your session has ended. Sign in again.");
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "23505") {
      throw new GameError("That X handle is already linked to another player.");
    }
    throw e;
  }
  if (await award(sql, userId, "profile", "profile", POINTS.profile)) invalidateBoard();
}

/** The player card: avatar, name, stack, fun fact, socials and directory choices. */
export async function savePlayer(userId: string, input: PlayerInput) {
  const sql = db();
  try {
    const [row] = await sql`
      update quest_profiles set
        full_name = ${input.full_name},
        avatar = ${input.avatar},
        stack = ${input.stack},
        fun_fact = ${input.fun_fact},
        github = ${input.github},
        linkedin = ${input.linkedin},
        x_handle = ${input.x_handle},
        x_handle_at = case when x_handle is distinct from ${input.x_handle} then now() else x_handle_at end,
        instagram = ${input.instagram},
        whatsapp = ${input.whatsapp},
        is_adult = true,
        listed = true,
        hidden = ${input.hidden},
        share_whatsapp = ${input.share_whatsapp && Boolean(input.whatsapp)},
        onboarded_at = coalesce(onboarded_at, now())
      where id = ${userId}
      returning id`;
    if (!row) throw new GameError("Your session has ended. Sign in again.");
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "23505") {
      throw new GameError("That X handle is already linked to another player.");
    }
    throw e;
  }
  if (await award(sql, userId, "profile", "profile", POINTS.profile)) invalidateBoard();
}

/* ---------- blocks ---------- */

const notBlocked = (me: string) => db()`
  and not exists (
    select 1 from quest_blocks b
    where (b.blocker = ${me} and b.blocked = p.id) or (b.blocker = p.id and b.blocked = ${me})
  )`;

/* ---------- directory ---------- */

export type ConnState = "none" | "requested" | "incoming" | "connected";
export type Agent = {
  id: string;
  name: string;
  initials: string;
  stack: string[];
  avatar: string | null;
  funFact: string | null;
  lastActive: string | null;
  state: ConnState;
  /** Role in the circle above attendee, added by the page. */
  role?: StaffRole | null;
};

function publicSocials(p: Pick<Profile, "github" | "linkedin" | "x_handle" | "instagram">) {
  const out: { label: string; href: string }[] = [];
  if (p.github) out.push({ label: "GitHub", href: links.github(p.github) });
  if (p.linkedin) out.push({ label: "LinkedIn", href: links.linkedin(p.linkedin) });
  if (p.x_handle) out.push({ label: "X", href: links.x_handle(p.x_handle) });
  if (p.instagram) out.push({ label: "Instagram", href: links.instagram(p.instagram) });
  return out;
}

/** Every player except those who chose to hide, and anyone blocked either way. Socials stay hidden until a padi request is accepted (or you scan each other). */
export async function directory(me: string) {
  const sql = db();
  const rows = await sql<(Profile & { status: string | null; requester: string | null })[]>`
    select p.id, p.full_name, p.stack, p.is_adult, p.avatar, p.fun_fact, p.last_active_at,
           c.status, c.requester
    from quest_profiles p
    left join quest_connections c
      on (c.user_a = least(p.id, ${me}::uuid) and c.user_b = greatest(p.id, ${me}::uuid))
    where p.id <> ${me} and p.onboarded_at is not null and not p.hidden
      ${notBlocked(me)}
    order by p.onboarded_at desc
    limit 1000`;
  return rows.map<Agent>((r) => ({
    id: r.id,
    name: displayName(r.full_name),
    initials: initials(r.full_name),
    stack: r.stack,
    avatar: r.avatar,
    funFact: r.fun_fact,
    lastActive: r.last_active_at ? new Date(r.last_active_at).toISOString() : null,
    state:
      r.status === "accepted"
        ? "connected"
        : r.status === "pending"
          ? r.requester === me
            ? "requested"
            : "incoming"
          : "none",
  }));
}

/* ---------- connections ---------- */

export async function requestConnection(me: Profile, otherId: string) {
  if (otherId === me.id) throw new GameError("That's you.");
  const sql = db();
  const [other] = await sql`
    select p.id from quest_profiles p
    where p.id = ${otherId} and p.onboarded_at is not null and not p.hidden ${notBlocked(me.id)}`;
  if (!other) throw new GameError("That player isn't available.");
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from quest_connections
    where requester = ${me.id} and created_at > now() - interval '1 hour'`;
  if (n >= LIMITS.connectsPerHour) throw new GameError("That's a lot of requests. Try again in an hour.");
  const [a, b] = order(me.id, otherId);
  // If they already asked you, connecting accepts their request.
  const rows = await sql<{ status: string }[]>`
    insert into quest_connections (user_a, user_b, requester)
    values (${a}, ${b}, ${me.id})
    on conflict (user_a, user_b) do update
      set status = 'accepted', responded_at = now()
      where quest_connections.status = 'pending' and quest_connections.requester <> ${me.id}
    returning status`;
  const padi = rows[0]?.status === "accepted";
  if (padi) await markPadiSeen(sql, me.id, otherId);
  return { padi };
}

export async function respondConnection(me: string, otherId: string, accept: boolean) {
  const [a, b] = order(me, otherId);
  const sql = db();
  const rows = await sql`
    update quest_connections
    set status = ${accept ? "accepted" : "declined"}, responded_at = now()
    where user_a = ${a} and user_b = ${b} and requester = ${otherId} and status = 'pending'
    returning user_a`;
  const padi = accept && rows.length > 0;
  if (padi) await markPadiSeen(sql, me, otherId);
  return { padi };
}

export async function blockAgent(me: string, otherId: string, report: boolean, reason: string) {
  if (me === otherId) return;
  const sql = db();
  const [a, b] = order(me, otherId);
  await sql.begin(async (tx) => {
    await tx`
      insert into quest_blocks (blocker, blocked, reported, reason)
      values (${me}, ${otherId}, ${report}, ${reason.slice(0, 500) || null})
      on conflict (blocker, blocked) do update
        set reported = quest_blocks.reported or excluded.reported,
            reason = coalesce(excluded.reason, quest_blocks.reason)`;
    await tx`delete from quest_connections where user_a = ${a} and user_b = ${b}`;
  });
}

export type CrewMember = {
  id: string;
  name: string;
  fullName: string;
  initials: string;
  stack: string[];
  avatar: string | null;
  funFact: string | null;
  lastActive: string | null;
  contacts: { label: string; href: string }[];
  met: boolean;
  role?: StaffRole | null;
};

export async function crew(me: string) {
  const sql = db();
  const rows = await sql<(Profile & { status: string; requester: string; met: boolean })[]>`
    select p.id, p.full_name, p.stack, p.github, p.linkedin, p.x_handle, p.instagram, p.whatsapp,
           p.share_whatsapp, p.is_adult, p.avatar, p.fun_fact, p.last_active_at, c.status, c.requester,
           exists (select 1 from quest_meets m where m.user_a = c.user_a and m.user_b = c.user_b) as met
    from quest_connections c
    join quest_profiles p on p.id = case when c.user_a = ${me} then c.user_b else c.user_a end
    where (c.user_a = ${me} or c.user_b = ${me})
      and (c.status = 'accepted' or (c.status = 'pending' and c.requester <> ${me}))
      ${notBlocked(me)}
    order by coalesce(c.responded_at, c.created_at) desc`;
  const toMember = (r: (typeof rows)[number], withContacts: boolean): CrewMember => {
    const contacts = withContacts ? publicSocials(r) : [];
    if (withContacts && r.whatsapp && r.share_whatsapp) {
      contacts.unshift({ label: "WhatsApp", href: links.whatsapp(r.whatsapp) });
    }
    return {
      id: r.id,
      name: displayName(r.full_name, r.is_adult),
      fullName: withContacts ? r.full_name : displayName(r.full_name),
      initials: initials(r.full_name),
      stack: r.stack,
      avatar: r.avatar,
      funFact: r.fun_fact,
      lastActive: r.last_active_at ? new Date(r.last_active_at).toISOString() : null,
      contacts,
      met: r.met,
    };
  };
  return {
    pending: rows.filter((r) => r.status === "pending").map((r) => toMember(r, false)),
    connected: rows.filter((r) => r.status === "accepted").map((r) => toMember(r, true)),
  };
}

/* ---------- Level Up ---------- */

export type QuizCard = {
  id: string;
  track: string;
  round: "daily" | "anytime" | "recap";
  learn: string;
  question: string;
  options: string[];
  setLabel: string;
  position: number;
  setSize: number;
};

type ItemRow = {
  id: string;
  round: QuizCard["round"];
  track: string;
  opens_on: string | null;
  learn: string;
  question: string;
  options: string[];
  set_key: string;
  answered: boolean;
};

/** Items this player can see now, in play order. The correct option is never selected. */
async function availableItems(userId: string) {
  const today = lagosToday();
  return db()<ItemRow[]>`
    select i.id, i.round, i.track, to_char(i.opens_on, 'YYYY-MM-DD') as opens_on, i.learn, i.question, i.options,
           coalesce(i.round || ':' || coalesce(to_char(i.opens_on, 'YYYY-MM-DD'), i.station_id::text, i.track), '') as set_key,
           (a.item_id is not null) as answered
    from quest_quiz_items i
    left join quest_quiz_answers a on a.item_id = i.id and a.user_id = ${userId}
    left join quest_stations s on s.id = i.station_id
    where (i.round = 'daily' and i.opens_on <= ${today})
       or i.round = 'anytime'
       or (i.round = 'recap' and s.closes_at < now()
           and exists (select 1 from quest_station_scans x where x.station_id = i.station_id and x.user_id = ${userId}))
    order by
      case when i.round = 'daily' and i.opens_on = ${today} then 0
           when i.round = 'recap' then 1
           when i.round = 'daily' then 2
           else 3 end,
      i.opens_on, i.track, i.sort, i.slug`;
}

async function streakDays(userId: string) {
  const days = await db()<{ day: string }[]>`
    select distinct to_char((at at time zone 'Africa/Lagos')::date, 'YYYY-MM-DD') as day
    from quest_quiz_answers where user_id = ${userId}
    order by day desc limit 30`;
  let streak = 0;
  let cursor = Date.parse(`${lagosToday()}T00:00:00Z`);
  const set = new Set(days.map((d) => d.day));
  if (!set.has(lagosToday())) cursor -= 86400_000; // a streak still stands until today ends
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak++;
    cursor -= 86400_000;
  }
  return streak;
}

function setLabel(item: ItemRow) {
  if (item.round === "recap") return `Session recap · ${item.track}`;
  if (item.round === "anytime") return item.track;
  const day = item.opens_on ? new Date(`${item.opens_on}T00:00:00Z`).getUTCDate() : 0;
  return `${day} Oct drop · ${item.track}`;
}

export async function levelUp(userId: string) {
  const items = await availableItems(userId);
  const next = items.find((i) => !i.answered) ?? null;
  const today = lagosToday();
  const todays = items.filter((i) => i.round === "daily" && i.opens_on === today);

  const tracks = new Map<string, { done: number; total: number }>();
  for (const i of items) {
    const t = tracks.get(i.track) ?? { done: 0, total: 0 };
    t.total++;
    if (i.answered) t.done++;
    tracks.set(i.track, t);
  }

  let card: QuizCard | null = null;
  if (next) {
    const set = items.filter((i) => i.set_key === next.set_key);
    card = {
      id: next.id,
      track: next.track,
      round: next.round,
      learn: next.learn,
      question: next.question,
      options: next.options,
      setLabel: setLabel(next),
      position: set.findIndex((i) => i.id === next.id) + 1,
      setSize: set.length,
    };
  }

  const [{ learnt }] = await db()<{ learnt: number }[]>`
    select count(*)::int as learnt from quest_quiz_answers
    where user_id = ${userId} and (at at time zone 'Africa/Lagos')::date = ${today}`;

  return {
    card,
    streak: await streakDays(userId),
    learntToday: learnt,
    today: {
      track: todays[0]?.track ?? null,
      total: todays.length,
      left: todays.filter((i) => !i.answered).length,
    },
    tracks: [...tracks.entries()].map(([name, t]) => ({ name, ...t })),
  };
}

export async function answerQuiz(userId: string, itemId: string, choice: number) {
  const items = await availableItems(userId);
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new GameError("That card isn't open.");
  if (!Number.isInteger(choice) || choice < 0 || choice >= item.options.length) throw new GameError("Pick an answer.");

  const sql = db();
  const today = lagosToday();
  const [key] = await sql<{ correct: number; explanation: string }[]>`
    select correct, explanation from quest_quiz_items where id = ${itemId}`;
  const correct = key.correct === choice;

  const [{ firstToday }] = await sql<{ firstToday: boolean }[]>`
    select not exists (
      select 1 from quest_quiz_answers
      where user_id = ${userId} and (at at time zone 'Africa/Lagos')::date = ${today}
    ) as "firstToday"`;
  const inserted = await sql`
    insert into quest_quiz_answers (user_id, item_id, choice, correct)
    values (${userId}, ${itemId}, ${choice}, ${correct})
    on conflict do nothing returning item_id`;

  let points = 0;
  if (inserted.length) {
    const kind = item.round === "recap" ? "recap" : "quiz";
    const value = item.round === "recap" ? POINTS.recap : POINTS.quiz;
    if (correct && (await award(sql, userId, kind, itemId, value))) points += value;
    if (firstToday && phase() === "pre" && (await streakDays(userId)) >= 2) {
      if (await award(sql, userId, "streak", today, POINTS.streak)) points += POINTS.streak;
    }
    if (points) invalidateBoard();
  }
  return { correct, correctIndex: key.correct, explanation: key.explanation, points, repeat: !inserted.length };
}

/* ---------- social missions ---------- */

export async function missions(userId: string) {
  const sql = db();
  const claims = await sql<{ platform: string; status: string }[]>`
    select platform, status from quest_social_claims where user_id = ${userId}`;
  const [{ postsToday, earned }] = await sql<{ postsToday: number; earned: number }[]>`
    select
      (select count(*)::int from quest_x_posts where user_id = ${userId} and status = 'counted') as "postsToday",
      (select coalesce(sum(points), 0)::int from quest_points
        where user_id = ${userId} and source_type in ('follow', 'community', 'x_post')) as earned`;
  const [{ pendingPosts }] = await sql<{ pendingPosts: number }[]>`
    select count(*)::int as "pendingPosts" from quest_x_posts where user_id = ${userId} and status = 'pending'`;
  const by = new Map(claims.map((c) => [c.platform, c.status]));
  const followed = FOLLOWS.filter((f) => by.has(f.id)).map((f) => f.id as string);
  const community = by.get("community") ?? null;
  const left = FOLLOWS.length - followed.length + (community ? 0 : 1) + (postsToday < LIMITS.xPosts ? 1 : 0);
  return { followed, community, postsToday, pendingPosts, earned, left };
}

export async function claimFollow(userId: string, platform: string) {
  if (!FOLLOWS.some((f) => f.id === platform)) throw new GameError("Unknown platform.");
  const sql = db();
  await sql`insert into quest_social_claims (user_id, platform) values (${userId}, ${platform}) on conflict do nothing`;
  if (await award(sql, userId, "follow", platform, POINTS.follow)) invalidateBoard();
}

/**
 * Taken on trust and paid now, like the follows. The claim stays 'claimed' (unverified) until
 * organisers upload the GDG Community member list, which marks it 'matched' and pays nothing twice.
 */
export async function claimCommunity(userId: string) {
  const sql = db();
  await sql`insert into quest_social_claims (user_id, platform) values (${userId}, 'community') on conflict do nothing`;
  if (!(await award(sql, userId, "community", "gdg-community", POINTS.community))) throw new GameError("You've already claimed this.");
  invalidateBoard();
}

/* ---------- invites ---------- */

export async function invitesPending(userId: string) {
  const [{ n }] = await db()<{ n: number }[]>`
    select count(*)::int as n from quest_profiles p
    where p.invited_by = ${userId}
      and not exists (select 1 from quest_checkins k where k.user_id = p.id)`;
  return n;
}

/* ---------- event day ---------- */

export function requireEventDay() {
  if (phase() !== "event") throw new GameError("This opens at the venue on 17 Oct.", "early");
}

export async function checkedInAt(userId: string) {
  const [row] = await db()<{ at: Date }[]>`select at from quest_checkins where user_id = ${userId} and day = ${eventDate()}`;
  return row?.at ?? null;
}

export async function checkIn(userId: string) {
  requireEventDay();
  const sql = db();
  const rows = await sql`
    insert into quest_checkins (user_id, day) values (${userId}, ${eventDate()})
    on conflict do nothing returning user_id`;
  if (!rows.length) return false;
  await award(sql, userId, "checkin", eventDate(), POINTS.checkin);
  // The person who invited them earns now, up to 5 friends.
  const [inviter] = await sql<{ id: string; paid: number }[]>`
    select i.id, (select count(*)::int from quest_points q where q.user_id = i.id and q.source_type = 'invite') as paid
    from quest_profiles p join quest_profiles i on i.id = p.invited_by
    where p.id = ${userId}`;
  if (inviter && inviter.paid < LIMITS.invitesPaid) await award(sql, inviter.id, "invite", userId, POINTS.invite);
  invalidateBoard();
  return true;
}

export async function agentByToken(token: string) {
  const [p] = await db()<Profile[]>`
    select id, full_name, stack, is_adult, avatar, fun_fact from quest_profiles where quest_token = ${token} and onboarded_at is not null`;
  return p ?? null;
}

export async function hasMet(a: string, b: string) {
  const [x, y] = order(a, b);
  const [row] = await db()`select 1 from quest_meets where user_a = ${x} and user_b = ${y}`;
  return Boolean(row);
}

/**
 * Scanning someone's QR: connects you both as padis at once and pays both of you.
 * Each pair scores once, whoever scans whom.
 */
export async function meet(me: Profile, token: string) {
  const other = await agentByToken(token);
  if (!other) throw new GameError("That QR isn't a DevFest Quest code.");
  if (other.id === me.id) throw new GameError("That's your own code. Scan someone else's.");
  const sql = db();
  const [blocked] = await sql`
    select 1 from quest_blocks
    where (blocker = ${me.id} and blocked = ${other.id}) or (blocker = ${other.id} and blocked = ${me.id})`;
  if (blocked) throw new GameError("You can't connect with this player.");
  const [{ recent }] = await sql<{ recent: number }[]>`
    select count(*)::int as recent from quest_meets
    where (user_a = ${me.id} or user_b = ${me.id}) and at > now() - interval '1 hour'`;
  if (recent >= LIMITS.meetsPerHour) throw new GameError("Slow down. Try again in a few minutes.");

  const [a, b] = order(me.id, other.id);
  const fresh = await sql.begin(async (tx) => {
    const rows = await tx`insert into quest_meets (user_a, user_b) values (${a}, ${b}) on conflict do nothing returning user_a`;
    if (!rows.length) return false;
    const pair = `${a}:${b}`;
    await award(tx, me.id, "meet", pair, POINTS.meet);
    await award(tx, other.id, "meet", pair, POINTS.meet);
    // Meeting in person connects you, sharing contacts by each person's settings.
    await markPadiSeen(tx, me.id, other.id);
    {
      await tx`
        insert into quest_connections (user_a, user_b, requester, status, responded_at)
        values (${a}, ${b}, ${me.id}, 'accepted', now())
        on conflict (user_a, user_b) do update set status = 'accepted', responded_at = now()`;
    }
    return true;
  });
  if (fresh) {
    await checkMissions(me.id);
    await checkMissions(other.id);
    invalidateBoard();
  }
  return {
    fresh,
    name: displayName(other.full_name, other.is_adult),
    avatar: other.avatar,
    connected: true,
  };
}

export async function scanStation(userId: string, code: string) {
  const sql = db();
  const [s] = await sql<{ id: string; kind: "room" | "booth"; name: string; slug: string | null; active: boolean; open: boolean }[]>`
    select id, kind, name, slug, active,
           (coalesce(opens_at <= now(), true) and coalesce(closes_at > now(), true)) as open
    from quest_stations where code = ${code}`;
  if (!s) throw new GameError("That code isn't a DevFest station.", "unknown");
  if (!s.active) throw new GameError("This booth code isn't active.", "inactive");
  if (s.kind === "booth") {
    // Partner stands are Stage 4 of the game: gated by the stage, not by check-in.
    const { requireStage } = await import("./stages");
    await requireStage(userId, "partners");
  } else {
    requireEventDay();
    if (!(await checkedInAt(userId))) throw new GameError("Check in at the entrance screen first.", "notin");
  }
  if (!s.open) {
    throw new GameError(s.kind === "room" ? "This room's code only works during its session." : "This booth is closed.", "closed");
  }
  const rows = await sql`
    insert into quest_station_scans (user_id, station_id) values (${userId}, ${s.id})
    on conflict do nothing returning user_id`;
  if (rows.length) {
    await award(sql, userId, s.kind, s.id, s.kind === "room" ? POINTS.room : POINTS.booth);
    await checkMissions(userId);
    invalidateBoard();
  }
  return { fresh: rows.length > 0, name: s.name, kind: s.kind, slug: s.slug };
}

/** Event-day missions: three different rooms; five people from outside your stack. */
async function checkMissions(userId: string) {
  const sql = db();
  const [m] = await sql<{ rooms: number; outside: number }[]>`
    select
      (select count(*)::int from quest_station_scans x join quest_stations s on s.id = x.station_id
        where x.user_id = ${userId} and s.kind = 'room') as rooms,
      (select count(*)::int from quest_meets m
        join quest_profiles me on me.id = ${userId}
        join quest_profiles o on o.id = case when m.user_a = ${userId} then m.user_b else m.user_a end
        where (m.user_a = ${userId} or m.user_b = ${userId}) and not (o.stack && me.stack)) as outside`;
  if (m.rooms >= 3) await award(sql, userId, "mission", "rooms3", POINTS.mission);
  if (m.outside >= 5) await award(sql, userId, "mission", "meet5", POINTS.mission);
}

export async function eventSummary(userId: string) {
  const sql = db();
  const stations = await sql<{ kind: string; name: string; at: Date; points: number }[]>`
    select s.kind, s.name, x.at, case when s.kind = 'room' then ${POINTS.room}::int else ${POINTS.booth}::int end as points
    from quest_station_scans x join quest_stations s on s.id = x.station_id
    where x.user_id = ${userId} order by x.at desc`;
  const meets = await sql<{ name: string; is_adult: boolean; at: Date }[]>`
    select o.full_name as name, o.is_adult, m.at
    from quest_meets m
    join quest_profiles o on o.id = case when m.user_a = ${userId} then m.user_b else m.user_a end
    where m.user_a = ${userId} or m.user_b = ${userId}
    order by m.at desc`;
  const recaps = await sql<{ name: string; closes_at: Date | null; open: boolean }[]>`
    select s.name, s.closes_at, (s.closes_at < now()) as open
    from quest_station_scans x join quest_stations s on s.id = x.station_id
    where x.user_id = ${userId} and s.kind = 'room'
      and exists (select 1 from quest_quiz_items i where i.station_id = s.id)
    order by s.closes_at`;
  const missionsDone = await sql<{ source_id: string }[]>`
    select source_id from quest_points where user_id = ${userId} and source_type = 'mission'`;
  return {
    stations,
    meets: meets.map((m) => ({ name: displayName(m.name, m.is_adult), at: m.at })),
    recaps,
    missions: missionsDone.map((m) => m.source_id),
  };
}

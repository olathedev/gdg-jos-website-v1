import "server-only";
import { db } from "@/lib/tickets/db";
import { HASHTAGS, LIMITS, POINTS, X_MENTION } from "./config";
import { GameError, type Profile } from "./game";
import { award, invalidateBoard } from "./points";

// X (Twitter) API v2, pay-per-use. The bearer token lives only on the server.
//   X_BEARER_TOKEN  app-only token from developer.x.com
// A post counts when it is from the handle on the player's profile, contains both
// hashtags and the mention, was posted after launch and after the handle was added,
// and the player has fewer than 3 counted posts that day (WAT).

const API = process.env.X_API_BASE ?? "https://api.x.com/2"; // override only for local testing
const LAUNCH = "2026-10-13T00:00:00+01:00";
const SEARCH_PAGES = 5; // up to 500 posts read per run
const QUERY = `${HASHTAGS.join(" ")} ${X_MENTION} -is:retweet`;

export const xEnabled = () => Boolean(process.env.X_BEARER_TOKEN);

type Tweet = { id: string; text: string; created_at: string; author_id: string };
type User = { id: string; username: string };
type XResponse = {
  data?: Tweet[] | Tweet;
  includes?: { users?: User[] };
  meta?: { newest_id?: string; next_token?: string };
  errors?: { resource_id?: string; type?: string; title?: string }[];
};

async function x(path: string, params: Record<string, string>) {
  const url = `${API}${path}?${new URLSearchParams({
    "tweet.fields": "created_at,author_id",
    expansions: "author_id",
    "user.fields": "username",
    ...params,
  })}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` }, cache: "no-store" });
  if (res.status === 429) throw new Error("X API rate limit");
  if (!res.ok && res.status !== 404) throw new Error(`X API ${res.status}: ${await res.text().catch(() => "")}`);
  return (await res.json()) as XResponse;
}

const asList = (d: XResponse["data"]) => (Array.isArray(d) ? d : d ? [d] : []);
const authorOf = (r: XResponse, t: Tweet) => r.includes?.users?.find((u) => u.id === t.author_id)?.username ?? "";

function contentOk(text: string) {
  const t = text.toLowerCase();
  return HASHTAGS.every((h) => t.includes(h.toLowerCase())) && t.includes(X_MENTION.toLowerCase());
}

type Owner = { id: string; x_handle: string; x_handle_at: Date | null };

/**
 * Tries to count one post for its owner. Returns why not, or null when it counted.
 * Safe to call repeatedly: the post id and the ledger are both unique.
 */
async function countPost(owner: Owner, tweet: Tweet, author: string): Promise<string | null> {
  const sql = db();
  const posted = new Date(tweet.created_at);
  let reason: string | null = null;
  if (author.toLowerCase() !== owner.x_handle.toLowerCase()) reason = "not from your handle";
  else if (!contentOk(tweet.text)) reason = `missing ${HASHTAGS.join(" / ")} or ${X_MENTION}`;
  else if (posted < new Date(LAUNCH)) reason = "posted before 13 Oct";
  else if (owner.x_handle_at && posted < owner.x_handle_at) reason = "posted before you added this handle";

  if (!reason) {
    const [{ n }] = await sql<{ n: number }[]>`
      select count(*)::int as n from quest_x_posts
      where user_id = ${owner.id} and status = 'counted' and post_id <> ${tweet.id}
        and (posted_at at time zone 'Africa/Lagos')::date = (${posted}::timestamptz at time zone 'Africa/Lagos')::date`;
    if (n >= LIMITS.xPostsPerDay) reason = "3 posts already counted that day";
  }

  await sql`
    insert into quest_x_posts (post_id, user_id, status, posted_at, reason, checked_at)
    values (${tweet.id}, ${owner.id}, ${reason ? "rejected" : "counted"}, ${posted}, ${reason}, now())
    on conflict (post_id) do update
      set status = excluded.status, posted_at = excluded.posted_at, reason = excluded.reason, checked_at = now()
      where quest_x_posts.status = 'pending' and quest_x_posts.user_id = excluded.user_id`;
  if (reason) return reason;
  if (await award(sql, owner.id, "x_post", tweet.id, POINTS.xPost)) invalidateBoard();
  return null;
}

async function ownerById(userId: string) {
  const [o] = await db()<Owner[]>`select id, x_handle, x_handle_at from quest_profiles where id = ${userId} and x_handle is not null`;
  return o ?? null;
}

/** A link pasted on the Missions screen. Checked now when the API is configured, else queued. */
export async function submitXPost(me: Profile, postId: string, handle: string) {
  if (!me.x_handle) throw new GameError("Add your X handle to your profile first.");
  if (handle.toLowerCase() !== me.x_handle.toLowerCase()) throw new GameError(`That post isn't from @${me.x_handle}.`);
  const sql = db();
  const [existing] = await sql<{ user_id: string; status: string }[]>`
    select user_id, status from quest_x_posts where post_id = ${postId}`;
  if (existing && existing.user_id !== me.id) throw new GameError("That post is linked to another agent.");
  if (existing?.status === "counted") throw new GameError("Already counted.");
  if (existing?.status === "rejected" || existing?.status === "removed") throw new GameError("That post didn't qualify.");

  if (!xEnabled()) {
    await sql`insert into quest_x_posts (post_id, user_id) values (${postId}, ${me.id}) on conflict do nothing`;
    return { status: "pending" as const, points: 0 };
  }

  const res = await x(`/tweets/${postId}`, {});
  const tweet = asList(res.data)[0];
  if (!tweet) throw new GameError("We couldn't find that post. Is it public?");
  const owner = await ownerById(me.id);
  const why = owner ? await countPost(owner, tweet, authorOf(res, tweet)) : "no handle";
  if (why) throw new GameError(`That post didn't count: ${why}.`);
  return { status: "counted" as const, points: POINTS.xPost };
}

/** Every 15 minutes: find new hashtag posts from players' handles, and check queued links. */
export async function syncXPosts() {
  if (!xEnabled()) return { skipped: "X_BEARER_TOKEN not set" };
  const sql = db();
  const owners = await sql<Owner[]>`
    select id, lower(x_handle) as x_handle, x_handle_at from quest_profiles where x_handle is not null`;
  const byHandle = new Map(owners.map((o) => [o.x_handle, o]));

  // 1. Recent search, resuming after the newest post seen last time.
  const [cursor] = await sql<{ value: string }[]>`select value from quest_meta where key = 'x_since_id'`;
  let newest = cursor?.value;
  let token: string | undefined;
  let read = 0;
  let counted = 0;
  for (let page = 0; page < SEARCH_PAGES; page++) {
    const res = await x("/tweets/search/recent", {
      query: QUERY,
      max_results: "100",
      ...(cursor?.value ? { since_id: cursor.value } : { start_time: new Date(Math.max(Date.parse(LAUNCH), Date.now() - 6.9 * 86400_000)).toISOString() }),
      ...(token && { next_token: token }),
    });
    if (page === 0 && res.meta?.newest_id) newest = res.meta.newest_id;
    for (const t of asList(res.data)) {
      read++;
      const author = authorOf(res, t).toLowerCase();
      const owner = byHandle.get(author);
      if (!owner) continue;
      const [done] = await sql`select 1 from quest_x_posts where post_id = ${t.id} and status <> 'pending'`;
      if (done) continue;
      if (!(await countPost(owner, t, author))) counted++;
    }
    token = res.meta?.next_token;
    if (!token) break;
  }
  if (newest) {
    await sql`
      insert into quest_meta (key, value) values ('x_since_id', ${newest})
      on conflict (key) do update set value = excluded.value, updated_at = now()`;
  }

  // 2. Pasted links waiting for a check.
  const pending = await sql<{ post_id: string; user_id: string }[]>`
    select post_id, user_id from quest_x_posts where status = 'pending' order by created_at limit 100`;
  let checked = 0;
  if (pending.length) {
    const res = await x("/tweets", { ids: pending.map((p) => p.post_id).join(",") });
    const found = new Map(asList(res.data).map((t) => [t.id, t]));
    for (const p of pending) {
      const t = found.get(p.post_id);
      const owner = await ownerById(p.user_id);
      if (!t || !owner) {
        await sql`update quest_x_posts set status = 'rejected', reason = 'not found', checked_at = now() where post_id = ${p.post_id}`;
        continue;
      }
      checked++;
      if (!(await countPost(owner, t, authorOf(res, t)))) counted++;
    }
  }
  return { read, counted, checked };
}

/** Daily: posts that were deleted since they counted lose their points. */
export async function recheckXPosts() {
  if (!xEnabled()) return { skipped: "X_BEARER_TOKEN not set" };
  const sql = db();
  const posts = await sql<{ post_id: string; user_id: string }[]>`
    select post_id, user_id from quest_x_posts where status = 'counted' order by posted_at`;
  let removed = 0;
  for (let i = 0; i < posts.length; i += 100) {
    const batch = posts.slice(i, i + 100);
    const res = await x("/tweets", { ids: batch.map((p) => p.post_id).join(",") });
    const alive = new Set(asList(res.data).map((t) => t.id));
    for (const p of batch) {
      if (alive.has(p.post_id)) continue;
      // Only "not found" errors mean deleted; anything else (suspended API, etc.) is left alone.
      const gone = res.errors?.some((e) => e.resource_id === p.post_id && /not.found/i.test(`${e.type} ${e.title}`));
      if (!gone) continue;
      await sql.begin(async (tx) => {
        await tx`update quest_x_posts set status = 'removed', reason = 'deleted', checked_at = now() where post_id = ${p.post_id}`;
        await tx`delete from quest_points where user_id = ${p.user_id} and source_type = 'x_post' and source_id = ${p.post_id}`;
      });
      removed++;
    }
  }
  if (removed) invalidateBoard();
  return { checked: posts.length, removed };
}

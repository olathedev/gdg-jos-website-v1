import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/tickets/db";
import type { ConnState, Profile } from "./game";
import { displayName, initials } from "./validate";

// Shareable profile links: /p/<slug>, e.g. /p/ada-o-7k2p. Built from the display name plus
// random characters; never an email or internal id. Created on first use and then fixed.

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function makeSlug(fullName: string) {
  const base =
    displayName(fullName)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "player";
  const bytes = randomBytes(4);
  const tail = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${base}-${tail}`;
}

export const SLUG = /^[a-z0-9-]{3,40}$/;

/** The player's slug, creating it the first time. */
export async function ensureSlug(me: Pick<Profile, "id" | "full_name"> & { slug?: string | null }) {
  if (me.slug) return me.slug;
  const sql = db();
  for (let i = 0; i < 5; i++) {
    const slug = makeSlug(me.full_name);
    const rows = await sql<{ slug: string }[]>`
      update quest_profiles set slug = ${slug} where id = ${me.id} and slug is null
      returning slug`.catch(() => [] as { slug: string }[]); // unique clash: try another
    if (rows.length) return rows[0].slug;
    const [existing] = await sql<{ slug: string | null }[]>`select slug from quest_profiles where id = ${me.id}`;
    if (existing?.slug) return existing.slug;
  }
  throw new Error("Could not create a profile link");
}

export type PublicProfile = {
  id: string;
  name: string;
  initials: string;
  avatar: string | null;
  stack: string[];
  funFact: string | null;
  lastActive: string | null;
  state: ConnState;
};

/** A profile for /p/<slug>, or null when it doesn't exist, is hidden or either side blocked the other. */
export async function profileBySlug(slug: string, viewerId: string): Promise<PublicProfile | "self" | null> {
  if (!SLUG.test(slug)) return null;
  const [r] = await db()<
    {
      id: string;
      full_name: string;
      avatar: string | null;
      stack: string[];
      fun_fact: string | null;
      last_active_at: Date | null;
      hidden: boolean;
      blocked: boolean;
      status: string | null;
      requester: string | null;
    }[]
  >`
    select p.id, p.full_name, p.avatar, p.stack, p.fun_fact, p.last_active_at, p.hidden,
           exists (select 1 from quest_blocks b
             where (b.blocker = ${viewerId} and b.blocked = p.id) or (b.blocker = p.id and b.blocked = ${viewerId})) as blocked,
           c.status, c.requester
    from quest_profiles p
    left join quest_connections c
      on c.user_a = least(p.id, ${viewerId}::uuid) and c.user_b = greatest(p.id, ${viewerId}::uuid)
    where p.slug = ${slug} and p.onboarded_at is not null`;
  if (!r) return null;
  if (r.id === viewerId) return "self";
  if (r.hidden || r.blocked) return null;
  return {
    id: r.id,
    name: displayName(r.full_name),
    initials: initials(r.full_name),
    avatar: r.avatar,
    stack: r.stack,
    funFact: r.fun_fact,
    lastActive: r.last_active_at ? new Date(r.last_active_at).toISOString() : null,
    state:
      r.status === "accepted" ? "connected" : r.status === "pending" ? (r.requester === viewerId ? "requested" : "incoming") : "none",
  };
}

/**
 * For a signed-out visitor and link previews: the owner's invite code (so signing up through
 * their link records who invited you) and their first name, or null when the profile is hidden
 * or the player is under 18. Nothing else about the person leaves the server.
 */
export async function inviteBySlug(slug: string) {
  if (!SLUG.test(slug)) return null;
  const [r] = await db()<{ full_name: string; is_adult: boolean; hidden: boolean; invite_code: string | null }[]>`
    select full_name, is_adult, hidden, invite_code from quest_profiles where slug = ${slug} and onboarded_at is not null`;
  if (!r) return null;
  const first = r.full_name.trim().split(/\s+/)[0] ?? "";
  return { firstName: r.hidden || !r.is_adult || !first ? null : first, inviteCode: r.invite_code };
}

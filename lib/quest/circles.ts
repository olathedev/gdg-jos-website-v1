import "server-only";
import { isOwnerEmail, ownerEmails } from "@/lib/admin/auth";
import { db } from "@/lib/tickets/db";
import { GameError } from "./game";
import { invalidateBoard } from "./points";
import { assignableRoles, CURRENT_CIRCLE, type Role, type StaffRole } from "./roles";
import { PARTNER_HANDLE } from "./validate";

// Circles and roles. Membership is implicit (everyone with a profile is in the one circle);
// roles above attendee live in quest_circle_roles. Owners in ADMIN_USERS are always organisers.

export type Circle = {
  id: string;
  slug: string;
  name: string;
  host_name: string;
  whatsapp_url: string | null;
  x: string | null;
  instagram: string | null;
  linkedin: string | null;
  facebook: string | null;
  youtube: string | null;
  website_url: string | null;
};

export async function getCircle(slug: string = CURRENT_CIRCLE) {
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  const [c] = await db()<Circle[]>`
    select id, slug, name, host_name, whatsapp_url, x, instagram, linkedin, facebook, youtube, website_url
    from quest_circles where slug = ${slug}`;
  return c ?? null;
}

export async function requireCircle(slug: string = CURRENT_CIRCLE) {
  const c = await getCircle(slug);
  if (!c) throw new GameError("That circle doesn't exist.");
  return c;
}

/** Someone's role in a circle. */
export async function roleOf(circleId: string, user: { id: string; email: string }): Promise<Role> {
  if (isOwnerEmail(user.email)) return "organiser";
  const [r] = await db()<{ role: StaffRole }[]>`select role from quest_circle_roles where circle_id = ${circleId} and user_id = ${user.id}`;
  return r?.role ?? "attendee";
}

/** Roles above attendee for many people at once (for badges in lists). */
export async function rolesFor(circleId: string, ids: string[]) {
  const map = new Map<string, StaffRole>();
  if (!ids.length) return map;
  const owners = ownerEmails();
  const rows = await db()<{ id: string; role: StaffRole | null; owner: boolean }[]>`
    select p.id, r.role, lower(p.email) = any(${owners}) as owner
    from quest_profiles p
    left join quest_circle_roles r on r.circle_id = ${circleId} and r.user_id = p.id
    where p.id = any(${ids}) and (r.role is not null or lower(p.email) = any(${owners}))`;
  for (const r of rows) map.set(r.id, r.owner ? "organiser" : r.role!);
  return map;
}

/** Roles in the current circle for people shown in a list. */
export async function currentRoles(ids: string[]) {
  const c = await getCircle();
  return { circle: c, roles: c ? await rolesFor(c.id, ids) : new Map<string, StaffRole>() };
}

/** Adds each person's role (or null) to a list of people. */
export const withRoles = <T extends { id: string }>(list: T[], roles: Map<string, StaffRole>) =>
  list.map((p) => ({ ...p, role: roles.get(p.id) ?? null }));

/** Organisers and co-organisers (they can't win prizes), owners included. */
export async function staffIds(circleId: string) {
  const owners = ownerEmails();
  const rows = await db()<{ id: string }[]>`
    select user_id as id from quest_circle_roles where circle_id = ${circleId} and role in ('organiser', 'co_organiser')
    union
    select id from quest_profiles where lower(email) = any(${owners})`;
  return new Set(rows.map((r) => r.id));
}

export async function isPlatformAdmin(me: { id: string; email: string }) {
  if (isOwnerEmail(me.email)) return true;
  const [r] = await db()<{ ok: boolean }[]>`select is_platform_admin as ok from quest_profiles where id = ${me.id}`;
  return Boolean(r?.ok);
}

/**
 * Changes someone's role, checking the caller against the rules every time:
 * never yourself, only roles you may give, owners are fixed, and a circle keeps at least one organiser.
 */
export async function setRole(circleId: string, actor: { id: string; email: string }, targetId: string, next: Role, inviteId: string | null = null) {
  if (targetId === actor.id) throw new GameError("You can't change your own role.");
  const sql = db();
  const [target] = await sql<{ id: string; email: string; full_name: string }[]>`
    select id, email, full_name from quest_profiles where id = ${targetId}`;
  if (!target) throw new GameError("That player doesn't exist.");
  if (isOwnerEmail(target.email)) throw new GameError("This organiser is set on the server and can't be changed here.");
  const [actorRole, current] = await Promise.all([roleOf(circleId, actor), roleOf(circleId, target)]);
  if (current === next) return { changed: false, current };
  if (!assignableRoles(actorRole, current).includes(next)) throw new GameError("You're not allowed to give that role.");

  await sql.begin(async (tx) => {
    // Lock the circle's organiser rows so two demotions can't remove the last organiser together.
    await tx`select 1 from quest_circle_roles where circle_id = ${circleId} and role = 'organiser' for update`;
    if (current === "organiser") {
      const owners = ownerEmails();
      const [{ n }] = await tx<{ n: number }[]>`
        select (select count(*)::int from quest_circle_roles where circle_id = ${circleId} and role = 'organiser' and user_id <> ${targetId})
             + (select count(*)::int from quest_profiles where lower(email) = any(${owners})) as n`;
      if (n < 1) throw new GameError("A circle needs at least one organiser.");
    }
    if (next === "attendee") await tx`delete from quest_circle_roles where circle_id = ${circleId} and user_id = ${targetId}`;
    else
      await tx`
        insert into quest_circle_roles (circle_id, user_id, role, granted_by)
        values (${circleId}, ${targetId}, ${next}, ${actor.id})
        on conflict (circle_id, user_id) do update set role = excluded.role, granted_by = excluded.granted_by, granted_at = now()`;
    await tx`
      insert into quest_role_changes (circle_id, user_id, actor_id, old_role, new_role, invite_id)
      values (${circleId}, ${targetId}, ${actor.id}, ${current}, ${next}, ${inviteId})`;
  });
  invalidateBoard(true);
  return { changed: true, current: next };
}

/* ---------- circle settings ---------- */

export type CircleSocials = Pick<Circle, "whatsapp_url" | "x" | "instagram" | "linkedin" | "facebook" | "youtube" | "website_url">;

export async function updateCircleSocials(circleId: string, actorId: string, s: CircleSocials) {
  await db()`
    update quest_circles set
      whatsapp_url = ${s.whatsapp_url}, x = ${s.x}, instagram = ${s.instagram}, linkedin = ${s.linkedin},
      facebook = ${s.facebook}, youtube = ${s.youtube}, website_url = ${s.website_url},
      updated_by = ${actorId}, updated_at = now()
    where id = ${circleId}`;
}

export const CIRCLE_SOCIALS = [
  { id: "x", name: "X", href: (h: string) => `https://x.com/${h}` },
  { id: "instagram", name: "Instagram", href: (h: string) => `https://www.instagram.com/${h}` },
  { id: "linkedin", name: "LinkedIn", href: (h: string) => `https://www.linkedin.com/company/${h}` },
  { id: "facebook", name: "Facebook", href: (h: string) => `https://www.facebook.com/${h}` },
  { id: "youtube", name: "YouTube", href: (h: string) => `https://www.youtube.com/@${h}` },
] as const;

/** Links for the socials row on Home: only platforms that are filled in. */
export function circleSocialLinks(c: Circle) {
  const out: { id: string; name: string; href: string }[] = CIRCLE_SOCIALS.flatMap((s) =>
    c[s.id] && PARTNER_HANDLE.test(c[s.id]!) ? [{ id: s.id, name: s.name, href: s.href(c[s.id]!) }] : [],
  );
  if (c.website_url) out.push({ id: "website", name: "website", href: c.website_url });
  return out;
}

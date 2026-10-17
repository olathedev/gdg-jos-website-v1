import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { isOwnerEmail } from "@/lib/admin/auth";
import { db } from "@/lib/tickets/db";
import type { Circle } from "./circles";
import { roleOf } from "./circles";
import { GameError } from "./game";
import { invalidateBoard } from "./points";
import { higher, inviteRoles, type Role, type StaffRole } from "./roles";
import { displayName } from "./validate";

// Role invite links: /c/<slug>/r/<token> gives a role to whoever joins through it.
// Only a SHA-256 hash of the token is stored, so a link can be copied only when it's created.

const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const MAX_MISSES = 10; // invalid tokens per user per 10 minutes

export type InviteInput = {
  role: StaffRole;
  maxUses: number;
  days: number;
  note: string;
};

export async function createRoleInvite(
  circle: Circle,
  actor: { id: string },
  actorRole: Role,
  input: InviteInput,
) {
  if (!inviteRoles(actorRole).includes(input.role))
    throw new GameError("You're not allowed to create that kind of link.");
  if (
    !Number.isInteger(input.maxUses) ||
    input.maxUses < 1 ||
    input.maxUses > 50
  )
    throw new GameError("Uses must be between 1 and 50.");
  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 30)
    throw new GameError("Expiry must be between 1 and 30 days.");
  const note = input.note.trim().slice(0, 120) || null;
  const token = randomBytes(24).toString("base64url"); // 32 characters
  const [row] = await db()<{ id: string }[]>`
    insert into quest_role_invites (circle_id, token_hash, role, max_uses, expires_at, note, created_by)
    values (${circle.id}, ${hash(token)}, ${input.role}, ${input.maxUses}, now() + make_interval(days => ${input.days}), ${note}, ${actor.id})
    returning id`;
  return { id: row.id, token };
}

export type InviteRow = {
  id: string;
  role: StaffRole;
  uses: number;
  maxUses: number;
  expiresAt: string;
  revoked: boolean;
  note: string | null;
  createdBy: string;
  createdAt: string;
  status: "active" | "revoked" | "used" | "expired";
  active: boolean;
};

export async function listRoleInvites(circle: Circle): Promise<InviteRow[]> {
  const rows = await db()<
    {
      id: string;
      role: StaffRole;
      uses: number;
      max_uses: number;
      expires_at: Date;
      revoked_at: Date | null;
      note: string | null;
      created_at: Date;
      name: string | null;
    }[]
  >`
    select i.id, i.role, i.uses, i.max_uses, i.expires_at, i.revoked_at, i.note, i.created_at, p.full_name as name
    from quest_role_invites i left join quest_profiles p on p.id = i.created_by
    where i.circle_id = ${circle.id}
    order by i.created_at desc limit 100`;
  const now = Date.now();
  return rows.map((r) => {
    const status = r.revoked_at
      ? "revoked"
      : r.uses >= r.max_uses
        ? "used"
        : r.expires_at.getTime() <= now
          ? "expired"
          : "active";
    return {
      id: r.id,
      role: r.role,
      uses: r.uses,
      maxUses: r.max_uses,
      expiresAt: r.expires_at.toISOString(),
      revoked: Boolean(r.revoked_at),
      note: r.note,
      createdBy: r.name ? displayName(r.name) : "Unknown",
      createdAt: r.created_at.toISOString(),
      status,
      active: status === "active",
    } as InviteRow;
  });
}

/** Organisers revoke any link; co-organisers only links they could create (speaker). */
export async function revokeRoleInvite(
  circle: Circle,
  actorRole: Role,
  id: string,
) {
  const allowed = inviteRoles(actorRole);
  if (!allowed.length) throw new GameError("You're not allowed to do that.");
  const rows = await db()`
    update quest_role_invites set revoked_at = now()
    where id = ${id} and circle_id = ${circle.id} and revoked_at is null and role = any(${allowed})
    returning id`;
  if (!rows.length)
    throw new GameError("That link is already off, or you can't revoke it.");
}

export type Redeemed =
  | { status: "granted" | "kept"; role: Role }
  | { status: "inactive" }
  | { status: "slow" };

/**
 * Someone signed in opened a role link. They join (membership is implicit) and get the link's
 * role only if it's higher than what they have: a link never lowers anyone.
 */
export async function redeemRoleInvite(
  circle: Circle,
  user: { id: string; email: string },
  token: string,
): Promise<Redeemed> {
  const sql = db();
  const [{ misses }] = await sql<{ misses: number }[]>`
    select count(*)::int as misses from quest_role_invite_misses where user_id = ${user.id} and at > now() - interval '10 minutes'`;
  if (misses >= MAX_MISSES) return { status: "slow" };
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) {
    await sql`insert into quest_role_invite_misses (user_id) values (${user.id})`;
    return { status: "inactive" };
  }

  return sql.begin(async (tx): Promise<Redeemed> => {
    const [inv] = await tx<
      {
        id: string;
        role: StaffRole;
        uses: number;
        max_uses: number;
        live: boolean;
        created_by: string | null;
      }[]
    >`
      select id, role, uses, max_uses, created_by, (revoked_at is null and expires_at > now()) as live
      from quest_role_invites where token_hash = ${hash(token)} and circle_id = ${circle.id}
      for update`;
    if (!inv) {
      await tx`insert into quest_role_invite_misses (user_id) values (${user.id})`;
      return { status: "inactive" };
    }
    const [used] =
      await tx`select 1 from quest_role_invite_uses where invite_id = ${inv.id} and user_id = ${user.id}`;
    const current = await roleOf(circle.id, user);
    if (used) return { status: "kept", role: current }; // opening your own link again doesn't use it up
    if (!inv.live || inv.uses >= inv.max_uses) return { status: "inactive" };

    await tx`insert into quest_role_invite_uses (invite_id, user_id) values (${inv.id}, ${user.id})`;
    await tx`update quest_role_invites set uses = uses + 1 where id = ${inv.id}`;
    if (isOwnerEmail(user.email) || !higher(inv.role, current))
      return { status: "kept", role: current };
    await tx`
      insert into quest_circle_roles (circle_id, user_id, role, granted_by)
      values (${circle.id}, ${user.id}, ${inv.role}, ${inv.created_by})
      on conflict (circle_id, user_id) do update set role = excluded.role, granted_by = excluded.granted_by, granted_at = now()`;
    await tx`
      insert into quest_role_changes (circle_id, user_id, actor_id, old_role, new_role, invite_id)
      values (${circle.id}, ${user.id}, ${inv.created_by}, ${current}, ${inv.role}, ${inv.id})`;
    invalidateBoard(true);
    return { status: "granted", role: inv.role };
  });
}

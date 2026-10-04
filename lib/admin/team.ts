import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/tickets/db";
import { ensureAdminTables, hashPassword, INVITE_HOURS, invitableBy, isOwnerEmail, MIN_PASSWORD, tokenHash, type AdminUser, type InvitableRole, type Role } from "./auth";

export type Member = {
  id: string;
  email: string;
  name: string | null;
  role: InvitableRole;
  invited_by: string | null;
  created_at: Date;
  activated_at: Date | null;
  invite_expires_at: Date | null;
  invite_expired: boolean;
};

export async function listMembers() {
  await ensureAdminTables();
  return db()<Member[]>`
    select id, email, name, role, invited_by, created_at, activated_at, invite_expires_at,
           (activated_at is null and invite_expires_at < now()) as invite_expired
    from admin_users where disabled_at is null
    order by case role when 'superadmin' then 1 when 'admin' then 2 else 3 end, created_at`;
}

const newToken = () => randomBytes(32).toString("base64url");

/** Create (or re-issue) an invite. Returns the raw token, shown once. */
export async function createInvite(actor: AdminUser, input: { email: string; name: string; role: InvitableRole }) {
  await ensureAdminTables();
  if (!invitableBy[actor.role].includes(input.role)) throw new InviteError("You can't add that role.");
  const email = input.email.trim().toLowerCase();
  if (isOwnerEmail(email)) throw new InviteError("That email is already an owner.");

  const sql = db();
  const [existing] = await sql<{ activated_at: Date | null; disabled_at: Date | null }[]>`
    select activated_at, disabled_at from admin_users where email = ${email}`;
  if (existing && existing.activated_at && !existing.disabled_at) throw new InviteError("That person already has access.");

  const token = newToken();
  await sql`
    insert into admin_users (email, name, role, invite_token_hash, invite_expires_at, invited_by)
    values (${email}, ${input.name.trim() || null}, ${input.role}, ${tokenHash(token)},
            now() + make_interval(hours => ${INVITE_HOURS}), ${actor.email})
    on conflict (email) do update set
      name = excluded.name, role = excluded.role, invite_token_hash = excluded.invite_token_hash,
      invite_expires_at = excluded.invite_expires_at, invited_by = excluded.invited_by,
      password_hash = null, activated_at = null, disabled_at = null`;
  return token;
}

/** New link for someone who hasn't accepted yet. */
export async function reissueInvite(actor: AdminUser, id: string) {
  const sql = db();
  const [m] = await sql<{ email: string; name: string | null; role: InvitableRole; activated_at: Date | null }[]>`
    select email, name, role, activated_at from admin_users where id = ${id} and disabled_at is null`;
  if (!m) throw new InviteError("Member not found.");
  if (m.activated_at) throw new InviteError("They've already set a password.");
  return createInvite(actor, { email: m.email, name: m.name ?? "", role: m.role });
}

export async function removeMember(actorRole: Role, canRemoveFn: (a: Role, t: Role) => boolean, id: string, actorEmail: string) {
  const sql = db();
  const [m] = await sql<{ email: string; role: Role }[]>`select email, role from admin_users where id = ${id} and disabled_at is null`;
  if (!m) throw new InviteError("Member not found.");
  if (m.email === actorEmail) throw new InviteError("You can't remove yourself.");
  if (!canRemoveFn(actorRole, m.role)) throw new InviteError("You can't remove someone at or above your level.");
  await sql`update admin_users set disabled_at = now(), invite_token_hash = null where id = ${id}`;
  return m.email;
}

/** Invite still valid? Returns who it's for. */
export async function findInvite(token: string) {
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(token)) return null;
  await ensureAdminTables();
  const [m] = await db()<{ email: string; name: string | null; role: InvitableRole }[]>`
    select email, name, role from admin_users
    where invite_token_hash = ${tokenHash(token)} and invite_expires_at > now()
      and activated_at is null and disabled_at is null`;
  return m ?? null;
}

export async function acceptInvite(token: string, password: string) {
  if (password.length < MIN_PASSWORD) throw new InviteError(`Use at least ${MIN_PASSWORD} characters.`);
  if (password.length > 200) throw new InviteError("That password is too long.");
  const invite = await findInvite(token);
  if (!invite) throw new InviteError("This invite link has expired or was already used.");
  const hash = await hashPassword(password);
  const rows = await db()`
    update admin_users set password_hash = ${hash}, activated_at = now(), invite_token_hash = null, invite_expires_at = null
    where invite_token_hash = ${tokenHash(token)} and activated_at is null and disabled_at is null
    returning id`;
  if (rows.length !== 1) throw new InviteError("This invite link has expired or was already used.");
  return invite;
}

export class InviteError extends Error {}

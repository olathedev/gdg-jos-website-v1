import "server-only";
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/tickets/db";

// Admin access:
//   ADMIN_PATH            secret URL segment, e.g. "ops-7Kq9x2" → https://site/ops-7Kq9x2
//   ADMIN_USERS           owners (bootstrap accounts) with their PIN: "ada@x.com:482913,bola@y.com:771204"
//   ADMIN_SESSION_SECRET  long random string used to sign sessions
// Owners invite everyone else (stored in the admin_users table) from the Team page.
// If any env var is missing, the admin area simply doesn't exist (404).

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const COOKIE = "dfj_admin";
const SESSION_HOURS = 12;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;
const LOCK_MINUTES = 15;
export const INVITE_HOURS = 72;
export const MIN_PASSWORD = 10;

export type Role = "owner" | "superadmin" | "admin" | "volunteer";
export type InvitableRole = Exclude<Role, "owner">;
export type AdminUser = { email: string; name: string | null; role: Role };

export const roleLabel: Record<Role, string> = { owner: "Owner", superadmin: "Super admin", admin: "Admin", volunteer: "Volunteer" };
const rank: Record<Role, number> = { owner: 4, superadmin: 3, admin: 2, volunteer: 1 };

/** Roles each role may invite. */
export const invitableBy: Record<Role, InvitableRole[]> = {
  owner: ["superadmin", "admin", "volunteer"],
  superadmin: ["admin", "volunteer"],
  admin: ["admin", "volunteer"],
  volunteer: [],
};

/** You can only remove people strictly below you (owners live in env, so they can't be removed here). */
export const canRemove = (actor: Role, target: Role) => target !== "owner" && rank[actor] > rank[target];

/** Roles that can open the admin dashboard (volunteers are for the future check-in app). */
export const dashboardRoles: Role[] = ["owner", "superadmin", "admin"];

export function adminPath() {
  const p = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  return p && /^[A-Za-z0-9_-]{6,64}$/.test(p) ? p : null;
}

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

/** Owner email → PIN. PINs must be at least 6 digits. */
function owners() {
  const map = new Map<string, string>();
  for (const entry of (process.env.ADMIN_USERS ?? "").split(",")) {
    const i = entry.lastIndexOf(":");
    if (i < 1) continue;
    const email = entry.slice(0, i).trim().toLowerCase();
    const pin = entry.slice(i + 1).trim();
    if (email.includes("@") && /^\d{6,12}$/.test(pin)) map.set(email, pin);
  }
  return map;
}

export const isOwnerEmail = (email: string) => owners().has(email.trim().toLowerCase());

export function adminEnabled() {
  return Boolean(adminPath() && secret() && owners().size > 0);
}

const hmac = (value: string) => createHmac("sha256", secret()!).update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(hmac(a), hmac(b)); // equal-length digests
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

/* ---------- passwords ---------- */

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string | null) {
  // Always do the work so timing doesn't reveal unknown accounts.
  const [, saltB64, keyB64] = (stored ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$").split("$");
  const key = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64 ?? "", "base64"), 64);
  const expected = Buffer.from(keyB64 ?? "", "base64");
  return Boolean(stored) && expected.length === key.length && timingSafeEqual(expected, key);
}

/* ---------- tables ---------- */

let tablesReady: Promise<unknown> | null = null;
export function ensureAdminTables() {
  const sql = db();
  tablesReady ??= sql.unsafe(`
    create table if not exists admin_login_attempts (
      id bigserial primary key,
      key text not null,
      ok boolean not null,
      at timestamptz not null default now()
    );
    create index if not exists admin_login_attempts_key_at on admin_login_attempts (key, at);
    alter table admin_login_attempts enable row level security;

    create table if not exists admin_users (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      name text,
      role text not null check (role in ('superadmin', 'admin', 'volunteer')),
      password_hash text,
      invite_token_hash text unique,
      invite_expires_at timestamptz,
      invited_by text,
      created_at timestamptz not null default now(),
      activated_at timestamptz,
      disabled_at timestamptz
    );
    alter table admin_users enable row level security;
  `);
  return tablesReady;
}

/** Look up who an email belongs to right now (env owners first, then active DB users). */
async function resolveUser(email: string): Promise<AdminUser | null> {
  if (isOwnerEmail(email)) return { email, name: null, role: "owner" };
  await ensureAdminTables();
  const [u] = await db()<{ email: string; name: string | null; role: Role }[]>`
    select email, name, role from admin_users
    where email = ${email} and activated_at is not null and disabled_at is null`;
  return u ?? null;
}

/* ---------- sessions ---------- */

function sign(payload: string) {
  return createHmac("sha256", secret()!).update(payload).digest("base64url");
}

export async function createSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + SESSION_HOURS * 3600_000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: `/${adminPath()}`,
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  (await cookies()).set(COOKIE, "", { path: `/${adminPath()}`, maxAge: 0 });
}

/** The signed-in user (any role), re-checked against env + database on every request. */
export async function currentUser(): Promise<AdminUser | null> {
  if (!adminEnabled()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e: string; x: number };
    if (Date.now() > x) return null;
    return await resolveUser(e);
  } catch {
    return null;
  }
}

/** Signed-in user who may use the admin dashboard, or null. */
export async function currentAdmin() {
  const u = await currentUser();
  return u && dashboardRoles.includes(u.role) ? u : null;
}

export async function requireAdmin() {
  const u = await currentAdmin();
  if (!u) throw new Error("Not authorised");
  return u;
}

/* ---------- login + brute-force protection ---------- */

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function attemptLogin(emailRaw: string, secretValue: string): Promise<LoginResult> {
  if (!adminEnabled()) return { ok: false, error: "Admin is not configured." };
  await ensureAdminTables();
  const sql = db();
  const email = emailRaw.trim().toLowerCase();
  const ip = await clientIp();
  const keys = { email: `email:${email}`, ip: `ip:${ip}` };

  const [{ byEmail, byIp }] = await sql<{ byEmail: number; byIp: number }[]>`
    select
      count(*) filter (where key = ${keys.email})::int as "byEmail",
      count(*) filter (where key = ${keys.ip})::int as "byIp"
    from admin_login_attempts
    where not ok and at > now() - make_interval(mins => ${LOCK_MINUTES})`;
  if (byEmail >= MAX_FAILS_PER_EMAIL || byIp >= MAX_FAILS_PER_IP) {
    return { ok: false, error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.` };
  }

  let ok = false;
  let role: Role | null = null;
  const pin = owners().get(email);
  if (pin !== undefined) {
    ok = safeEqual(secretValue, pin);
    role = "owner";
  } else {
    const [u] = await sql<{ password_hash: string | null; role: Role }[]>`
      select password_hash, role from admin_users
      where email = ${email} and activated_at is not null and disabled_at is null`;
    ok = await verifyPassword(secretValue, u?.password_hash ?? null);
    role = u?.role ?? null;
  }

  await sql`insert into admin_login_attempts ${sql([
    { key: keys.email, ok },
    { key: keys.ip, ok },
  ])}`;

  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "That email and password don't match." };
  }
  if (!role || !dashboardRoles.includes(role)) {
    return { ok: false, error: "Volunteer accounts can't open the admin dashboard." };
  }
  await createSession(email);
  return { ok: true };
}

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/tickets/db";

// Admin access is configured entirely through env vars:
//   ADMIN_PATH            secret URL segment, e.g. "ops-7Kq9x2" → https://site/ops-7Kq9x2
//   ADMIN_USERS           whitelist with per-person PINs: "ada@x.com:482913,bola@y.com:771204"
//   ADMIN_SESSION_SECRET  long random string used to sign sessions
// If any is missing, the admin area simply doesn't exist (404).

export const COOKIE = "dfj_admin";
const SESSION_HOURS = 12;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;
const LOCK_MINUTES = 15;

export function adminPath() {
  const p = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  return p && /^[A-Za-z0-9_-]{6,64}$/.test(p) ? p : null;
}

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

/** email → PIN. PINs must be at least 6 digits. */
function users() {
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

export function adminEnabled() {
  return Boolean(adminPath() && secret() && users().size > 0);
}

const hmac = (value: string) => createHmac("sha256", secret()!).update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(hmac(a), hmac(b)); // equal-length digests

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

/** Returns the signed-in admin's email, or null. Re-checks the whitelist every time. */
export async function currentAdmin(): Promise<string | null> {
  if (!adminEnabled()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e: string; x: number };
    if (Date.now() > x || !users().has(e)) return null;
    return e;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) throw new Error("Not authorised");
  return email;
}

/* ---------- login + brute-force protection ---------- */

let tableReady: Promise<unknown> | null = null;
function ensureAttemptsTable() {
  const sql = db();
  tableReady ??= sql.unsafe(`
    create table if not exists admin_login_attempts (
      id bigserial primary key,
      key text not null,
      ok boolean not null,
      at timestamptz not null default now()
    );
    create index if not exists admin_login_attempts_key_at on admin_login_attempts (key, at);
    alter table admin_login_attempts enable row level security;
  `);
  return tableReady;
}

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function attemptLogin(emailRaw: string, pin: string): Promise<LoginResult> {
  if (!adminEnabled()) return { ok: false, error: "Admin is not configured." };
  await ensureAttemptsTable();
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

  const stored = users().get(email);
  // Always run a comparison so response time doesn't reveal whether the email is whitelisted.
  const ok = safeEqual(pin, stored ?? "\u0000no-such-user") && stored !== undefined;

  await sql`insert into admin_login_attempts ${sql([
    { key: keys.email, ok },
    { key: keys.ip, ok },
  ])}`;

  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "That email and PIN don't match." };
  }
  await createSession(email);
  return { ok: true };
}

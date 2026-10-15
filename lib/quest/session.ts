import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Attendee sessions for /quest. Separate from the admin session: different cookie,
// different secret. Google sign-in goes through Supabase Auth; after that the app keeps
// its own signed session cookie and never stores Supabase tokens.
//   QUEST_SESSION_SECRET  long random string (openssl rand -hex 32)
//   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or _ANON_KEY)  Google
//     enabled under Authentication → Providers; <site>/quest/auth/callback allowed under
//     Authentication → URL Configuration → Redirect URLs.

export const SESSION_COOKIE = "dfj_quest";
export const STATE_COOKIE = "dfj_quest_oauth"; // PKCE verifier + invite + return path
export const REF_COOKIE = "dfj_quest_ref";
export const CHECKIN_COOKIE = "dfj_quest_checkin";
const SESSION_DAYS = 30;

export const isDev = process.env.NODE_ENV === "development";

function secret() {
  const s = process.env.QUEST_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  return isDev ? "dev-only-quest-secret-not-for-production-use" : null;
}

export const questEnabled = () => Boolean(secret());
/** Supabase's public key: the newer "publishable" name or the legacy "anon" name. */
export const supabaseKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseAuthEnabled = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey());
/** Email sign-in without Google, for local testing with several accounts. */
export const devLoginEnabled = () => isDev;

export const hmac = (value: string) => createHmac("sha256", secret()!).update(value).digest("base64url");
export const randomToken = (bytes = 18) => randomBytes(bytes).toString("base64url");

/** `payload.signature`, payload being base64url JSON with an expiry. */
export function seal(data: object, ttlSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ ...data, x: Date.now() + ttlSeconds * 1000 })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function unseal<T>(raw: string | undefined): T | null {
  if (!raw || !secret()) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as T & { x: number };
    return Date.now() > data.x ? null : data;
  } catch {
    return null;
  }
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // the Google redirect back must carry it
  path: "/",
  maxAge,
});

export async function createSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, seal({ u: userId }, SESSION_DAYS * 86400), cookieOptions(SESSION_DAYS * 86400));
}

export async function destroySession() {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/** The signed-in attendee's profile id, or null. */
export async function sessionUserId() {
  return unseal<{ u: string }>((await cookies()).get(SESSION_COOKIE)?.value)?.u ?? null;
}

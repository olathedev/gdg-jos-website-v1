import "server-only";
import { createHash } from "node:crypto";
import { randomToken, supabaseKey } from "./session";

// Google sign-in through Supabase Auth's OAuth endpoints, PKCE flow (what supabase-js
// does under the hood). Only used to learn who signed in; the session is our own cookie.

const base = () => process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
const key = supabaseKey;

export function startGoogle(redirectTo: string) {
  const verifier = randomToken(48);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL(`${base()}/auth/v1/authorize`);
  url.search = new URLSearchParams({
    provider: "google",
    redirect_to: redirectTo,
    code_challenge: challenge,
    code_challenge_method: "s256",
  }).toString();
  return { url: url.toString(), verifier };
}

export type AuthUser = { id: string; email: string; name: string };

type TokenResponse = {
  user?: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    user_metadata?: { full_name?: string; name?: string };
  };
};

/** Trades the one-time code from the redirect for the signed-in user. Null on any failure. */
export async function finishGoogle(code: string, verifier: string): Promise<AuthUser | null> {
  const res = await fetch(`${base()}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: { apikey: key(), "Content-Type": "application/json" },
    body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[quest] Supabase code exchange failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  const { user } = (await res.json()) as TokenResponse;
  if (!user?.id || !user.email || !user.email_confirmed_at) return null;
  return {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
  };
}

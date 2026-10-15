import { NextResponse } from "next/server";
import { safeNext } from "@/lib/quest/auth";
import { cookieOptions, devLoginEnabled, seal, STATE_COOKIE, supabaseAuthEnabled } from "@/lib/quest/session";
import { startGoogle } from "@/lib/quest/supabase-auth";

/** Starts Google sign-in via Supabase Auth. The PKCE verifier, invite code and return path ride in a signed cookie. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const ref = params.get("ref")?.match(/^[A-Za-z0-9_-]{4,16}$/)?.[0] ?? null;
  const next = safeNext(params.get("next"));
  // The host the visitor is actually on, so localhost sign-in returns to localhost
  // (NEXT_PUBLIC_SITE_URL points at the live site even in local dev).
  const base = new URL(req.url).origin;

  if (!supabaseAuthEnabled()) {
    if (devLoginEnabled()) {
      const q = new URLSearchParams({ ...(ref && { ref }), ...(next && { next }) });
      return NextResponse.redirect(`${base}/quest/auth/dev?${q}`);
    }
    return NextResponse.redirect(`${base}/quest?error=signin`);
  }

  const { url, verifier } = startGoogle(`${base}/quest/auth/callback`);
  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, seal({ v: verifier, ref, next }, 600), cookieOptions(600));
  return res;
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { completePendingCheckin } from "@/lib/quest/auth";
import { getProfile, upsertAuthUser } from "@/lib/quest/game";
import { createSession, STATE_COOKIE, unseal } from "@/lib/quest/session";
import { finishGoogle } from "@/lib/quest/supabase-auth";

type State = { v: string; ref: string | null; next: string | null };

/** Supabase Auth sends people back here with ?code=… after Google. */
export async function GET(req: Request) {
  // The host the visitor is actually on, so localhost sign-in returns to localhost
  // (NEXT_PUBLIC_SITE_URL points at the live site even in local dev).
  const base = new URL(req.url).origin;
  const params = new URL(req.url).searchParams;
  const jar = await cookies();
  const state = unseal<State>(jar.get(STATE_COOKIE)?.value);
  jar.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });

  const code = params.get("code");
  if (!state || !code) return NextResponse.redirect(`${base}/quest?error=signin`);
  const user = await finishGoogle(code, state.v);
  if (!user) return NextResponse.redirect(`${base}/quest?error=signin`);

  const id = await upsertAuthUser(user.id, user.email, user.name, state.ref);
  await createSession(id);
  const checkedIn = await completePendingCheckin(id);
  const me = await getProfile(id);
  const dest = !me?.onboarded_at ? "/quest/setup" : checkedIn ? "/quest/event" : (state.next ?? "/quest/home");
  return NextResponse.redirect(`${base}${dest}`);
}

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { checkIn, GameError, getProfile } from "./game";
import { CHECKIN_COOKIE, sessionUserId, unseal } from "./session";
import { phase } from "./time";

/** The signed-in attendee, once per request. */
export const getMe = cache(async () => {
  const id = await sessionUserId();
  return id ? getProfile(id) : null;
});

export async function requireMe() {
  const me = await getMe();
  if (!me) redirect("/quest");
  return me;
}

/** Signed in and finished "Build your agent". */
export async function requireAgent() {
  const me = await requireMe();
  if (!me.onboarded_at) redirect("/quest/setup");
  return me;
}

/** Only for safe in-app redirects after sign-in. */
export const safeNext = (next: string | null | undefined) =>
  next && /^\/quest(\/[A-Za-z0-9/_?=&.-]*)?$/.test(next) && !next.startsWith("//") ? next : null;

/**
 * Someone scanned the entrance QR before signing in: the code was checked then and
 * held in a 10-minute cookie. Called from route handlers right after sign-in.
 */
export async function completePendingCheckin(userId: string) {
  const jar = await cookies();
  const pending = unseal<{ ok: boolean }>(jar.get(CHECKIN_COOKIE)?.value);
  if (!pending?.ok) return false;
  jar.set(CHECKIN_COOKIE, "", { path: "/", maxAge: 0 });
  if (phase() !== "event") return false;
  try {
    await checkIn(userId);
    return true;
  } catch (e) {
    if (e instanceof GameError) return false;
    throw e;
  }
}

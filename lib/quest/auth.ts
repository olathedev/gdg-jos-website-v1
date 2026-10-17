import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { touchActive } from "./active";
import { checkIn, GameError, getProfile } from "./game";
import { CHECKIN_COOKIE, sessionUserId, unseal } from "./session";
import { hasSocial } from "./validate";
import { phase } from "./time";

/** The signed-in attendee, once per request. */
export const getMe = cache(async () => {
  const id = await sessionUserId();
  if (!id) return null;
  const me = await getProfile(id);
  if (me) await touchActive(me.id);
  return me;
});

export async function requireMe() {
  const me = await getMe();
  if (!me) redirect("/quest");
  return me;
}

/** Signed in with a finished player card (an avatar picked). */
export async function requireAgent() {
  const me = await requireMe();
  if (!me.onboarded_at || !me.avatar) redirect("/quest/setup");
  // Players from before socials were required add one before they carry on.
  if (!hasSocial(me)) redirect("/quest/setup?need=social");
  return me;
}

/** Only for safe in-app redirects after sign-in: game pages, profile links and circle links. */
export const safeNext = (next: string | null | undefined) =>
  next &&
  (/^\/quest(\/[A-Za-z0-9/_?=&.-]*)?$/.test(next) ||
    /^\/p\/[a-z0-9-]{3,40}$/.test(next) ||
    /^\/c\/[a-z0-9-]{3,40}(\/admin|\/r\/[A-Za-z0-9_-]{24,64})?$/.test(next)) &&
  !next.startsWith("//")
    ? next
    : null;

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

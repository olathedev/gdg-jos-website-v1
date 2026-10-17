import "server-only";
import { db } from "@/lib/tickets/db";

// "Active now": a signed-in player's last request, written at most once every 2 minutes.
// The in-memory map skips the database round trip on most requests; the conditional
// update keeps it to one write per window even across several server instances.

const WINDOW_MS = 2 * 60_000;
const seen = (globalThis as unknown as { questSeen?: Map<string, number> }).questSeen ?? new Map<string, number>();
(globalThis as unknown as { questSeen?: Map<string, number> }).questSeen = seen;

export async function touchActive(userId: string) {
  const now = Date.now();
  if (now - (seen.get(userId) ?? 0) < WINDOW_MS) return;
  seen.set(userId, now);
  if (seen.size > 5000) seen.clear();
  try {
    await db()`
      update quest_profiles set last_active_at = now()
      where id = ${userId} and (last_active_at is null or last_active_at < now() - interval '2 minutes')`;
  } catch {
    // Never let presence tracking break a page.
  }
}

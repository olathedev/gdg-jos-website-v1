import "server-only";
import { timingSafeEqual } from "node:crypto";
import { LIMITS } from "./config";
import { hmac } from "./session";

// The entrance screen shows a QR that changes every 30 seconds, so a photo
// forwarded on WhatsApp is useless by the time anyone at home opens it.

const windowAt = (ms: number) => Math.floor(ms / (LIMITS.checkinWindow * 1000));
const codeFor = (w: number) => hmac(`checkin:${w}`).slice(0, 12);

export function currentEntranceCode() {
  const now = Date.now();
  const w = windowAt(now);
  const msLeft = (w + 1) * LIMITS.checkinWindow * 1000 - now;
  return { code: codeFor(w), msLeft };
}

/** Accepts the current code and the one before it, so a scan at the turnover still works. */
export function entranceCodeValid(code: string) {
  if (!/^[A-Za-z0-9_-]{12}$/.test(code)) return false;
  const w = windowAt(Date.now());
  return [w, w - 1].some((x) => timingSafeEqual(Buffer.from(codeFor(x)), Buffer.from(code)));
}

/** The hall screen is a secret URL: /quest/hall?key=<QUEST_HALL_KEY>. */
export function hallKeyValid(key: string | null | undefined) {
  const expected = process.env.QUEST_HALL_KEY ?? (process.env.NODE_ENV === "development" ? "dev" : "");
  if (!expected || !key || key.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(key), Buffer.from(expected));
}

import { EVENT_DAY } from "./config";

export type Phase = "pre" | "event" | "post";

/** Today's date in Jos (WAT, UTC+1, no daylight saving) as YYYY-MM-DD. */
export function lagosToday(now = new Date()) {
  return new Date(now.getTime() + 3600_000).toISOString().slice(0, 10);
}

/**
 * pre: before event day (Phase 1 only). event: event day (Phase 2 on). post: after.
 * QUEST_PHASE forces a phase, for testing venue features locally and for the dry run on
 * 16 Oct. Remove it afterwards.
 */
export function phase(): Phase {
  const forced = process.env.QUEST_PHASE;
  if (forced === "pre" || forced === "event" || forced === "post") return forced;
  const today = lagosToday();
  return today < EVENT_DAY ? "pre" : today === EVENT_DAY ? "event" : "post";
}

/** The date Phase 2 rows are stored under (check-ins). Forced event phase uses the real date. */
export const eventDate = () => (phase() === "event" && process.env.QUEST_PHASE === "event" ? lagosToday() : EVENT_DAY);

export function daysUntilEvent() {
  const ms = Date.parse(`${EVENT_DAY}T00:00:00Z`) - Date.parse(`${lagosToday()}T00:00:00Z`);
  return Math.max(0, Math.round(ms / 86400_000));
}

export function timeLabel(d: Date | string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(d));
}

/** One timestamp per render, so server and browser agree on "N min ago". */
export const serverNow = () => Date.now();

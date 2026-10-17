// Shared by server and client: how "last active" is shown.

/** "Active now" under 2 minutes, "Active N min ago" up to 60, otherwise nothing. */
export function activeLabel(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return null;
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (mins < 2) return "Active now";
  if (mins <= 60) return `Active ${mins} min ago`;
  return null;
}

/** "Here now" in the directory: active in the last 15 minutes. */
export const isHereNow = (iso: string | null | undefined, now = Date.now()) =>
  Boolean(iso) && now - new Date(iso as string).getTime() <= 15 * 60_000;

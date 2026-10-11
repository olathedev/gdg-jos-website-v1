import "server-only";
import { headers } from "next/headers";

/** Public base URL for links in emails sent from admin actions. */
export async function adminSiteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

import { PARTNER_HANDLE, PARTNER_SOCIALS, type PartnerSocial } from "./validate";

// One set of rules for partner profiles, wherever they're edited (admin area, circle admin,
// a partner's own managers): handles only, https links only, 280 plain-text characters.

/** https links only: a website or a logo image. null when empty, undefined when invalid. */
export function httpsUrl(raw: string) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && u.hostname.includes(".") ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** What a partner's managers may change. */
export type PartnerPublic = { description: string | null; website_url: string | null; logo_url: string | null } & Record<PartnerSocial, string | null>;
/** Everything organisers may change. */
export type PartnerFull = PartnerPublic & { name: string; sort_order: number; active: boolean };

type Parsed<T> = { ok: true; data: T } | { ok: false; message: string };

export function parsePartnerPublic(form: FormData): Parsed<PartnerPublic> {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  const description = get("description").replace(/\r\n/g, "\n");
  if (description.length > 280) return { ok: false, message: "Keep the description to 280 characters." };
  const website_url = httpsUrl(get("website_url"));
  if (website_url === undefined) return { ok: false, message: "The website must be a full https:// link." };
  const logo_url = httpsUrl(get("logo_url"));
  if (logo_url === undefined) return { ok: false, message: "The logo must be a full https:// image link." };
  const handles = {} as Record<PartnerSocial, string | null>;
  for (const s of PARTNER_SOCIALS) {
    const h = get(s.id).replace(/^@/, "");
    if (h && !PARTNER_HANDLE.test(h)) return { ok: false, message: `${s.name}: enter the handle only, e.g. gdgjos (letters, digits, . _ -).` };
    handles[s.id] = h || null;
  }
  return { ok: true, data: { description: description || null, website_url, logo_url, ...handles } };
}

export function parsePartnerFull(form: FormData, { withName = true } = {}): Parsed<PartnerFull> {
  const pub = parsePartnerPublic(form);
  if (!pub.ok) return pub;
  const name = String(form.get("name") ?? "").trim();
  if (withName && (name.length < 2 || name.length > 60)) return { ok: false, message: "Enter the partner's name (2 to 60 characters)." };
  const sort_order = Number.parseInt(String(form.get("sort_order") ?? "").trim() || "0", 10);
  if (!Number.isInteger(sort_order) || Math.abs(sort_order) > 9999) return { ok: false, message: "Order must be a whole number." };
  return { ok: true, data: { ...pub.data, name, sort_order, active: form.get("active") === "on" } };
}

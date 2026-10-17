import { z } from "zod";
import { AVATARS, STACK_LABELS } from "./config";

// Users type handles, never links; the app builds every link itself.

const optional = (re: RegExp, msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .refine((v) => v === "" || re.test(v), msg)
    .transform((v) => v || null);

export const handles = {
  github: optional(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/, "GitHub usernames use letters, digits and dashes."),
  linkedin: optional(/^[A-Za-z0-9_-]{3,100}$/, "LinkedIn usernames use letters, digits, dashes and underscores."),
  x_handle: optional(/^[A-Za-z0-9_]{1,15}$/, "X handles are up to 15 letters, digits or underscores."),
  instagram: optional(/^[A-Za-z0-9._]{1,30}$/, "Instagram usernames use letters, digits, dots and underscores."),
};

/** Nigerian or international number → digits with country code, or null. */
export function normaliseWhatsapp(raw: string) {
  const digits = raw.replace(/[\s()-]/g, "").replace(/^\+/, "");
  if (!digits) return null;
  if (!/^\d{10,15}$/.test(digits)) return undefined;
  if (digits.startsWith("0") && digits.length === 11) return `234${digits.slice(1)}`;
  return digits;
}

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(60, "Keep your name under 60 characters.")
    .refine((v) => !/[<>{}\\]/.test(v), "Use letters only in your name."),
  stack: z.array(z.string().refine((s) => STACK_LABELS.includes(s))).max(3, "Pick up to 3."),
  ...handles,
  whatsapp: z
    .string()
    .transform((v) => normaliseWhatsapp(v))
    .refine((v) => v !== undefined, "Enter a phone number like 0803 000 0000.")
    .transform((v) => v ?? null),
  is_adult: z.boolean(),
  listed: z.boolean(),
  share_whatsapp: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** The player card. Socials are usernames; the app builds every link itself. */
export const playerSchema = z.object({
  full_name: profileSchema.shape.full_name,
  avatar: z.string().refine((v) => AVATARS.some((a) => a.id === v), "Pick an avatar."),
  stack: z
    .array(z.string().refine((s) => STACK_LABELS.includes(s)))
    .min(1, "Pick at least one stack.")
    .max(3, "Pick up to 3."),
  fun_fact: z
    .string()
    .trim()
    .max(90, "Keep your fun fact under 90 characters.")
    .refine((v) => !/[<>{}\\]/.test(v) && !/https?:|www\./i.test(v), "No links in your fun fact.")
    .transform((v) => v || null),
  ...handles,
  whatsapp: profileSchema.shape.whatsapp,
  share_whatsapp: z.boolean(),
}).refine((d) => Boolean(d.github || d.linkedin || d.x_handle || d.instagram || d.whatsapp), {
  message: "Add at least one social: GitHub, LinkedIn, X, Instagram or WhatsApp.",
});

export type PlayerInput = z.infer<typeof playerSchema>;

export const links = {
  github: (h: string) => `https://github.com/${h}`,
  linkedin: (h: string) => `https://www.linkedin.com/in/${h}`,
  x_handle: (h: string) => `https://x.com/${h}`,
  instagram: (h: string) => `https://www.instagram.com/${h}`,
  whatsapp: (n: string) => `https://wa.me/${n}`,
};

/** "Ada Okafor" → "Ada O." for everyone. The second argument is kept for older callers. */
export function displayName(fullName: string | null | undefined, _isAdult = true) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Player";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function initials(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** X status URL → post id. */
export function xPostId(url: string) {
  const m = url.trim().match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{1,25})/);
  return m ? { handle: m[1], id: m[2] } : null;
}

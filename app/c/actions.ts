"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { z } from "zod";
import { adminSiteUrl } from "@/lib/admin/site";
import { cloudinaryEnabled, type SignedUpload, signUpload } from "@/lib/cloudinary";
import { getMe } from "@/lib/quest/auth";
import { removePhoto } from "@/lib/quest/circle-admin";
import { requireCircle, roleOf, setRole } from "@/lib/quest/circles";
import { GameError } from "@/lib/quest/game";
import { createRoleInvite, revokeRoleInvite } from "@/lib/quest/invites";
import {
  addManager,
  addPartnerByName,
  isPartnerManager,
  removeManager,
  resetBoothCode,
  updatePartnerFull,
  updatePartnerPublic,
} from "@/lib/quest/partner-admin";
import { parsePartnerFull, parsePartnerPublic } from "@/lib/quest/partner-input";
import { isStaff, ROLES, roleLabel, type Role, type StaffRole } from "@/lib/quest/roles";
import { displayName } from "@/lib/quest/validate";
import { db } from "@/lib/tickets/db";

export type AdminResult = { ok: boolean; message: string } | null;

const uuid = z.uuid();

/** The signed-in player, the circle and their role there. Throws unless they're staff (or `staffOnly` is false). */
async function context(slug: string, staffOnly = true) {
  const me = await getMe();
  if (!me?.onboarded_at) throw new GameError("Sign in first.");
  const circle = await requireCircle(slug);
  const role = await roleOf(circle.id, me);
  if (staffOnly && !isStaff(role)) throw new GameError("You're not allowed to do that.");
  return { me, circle, role };
}

async function run(slug: string, fn: () => Promise<string>): Promise<AdminResult> {
  try {
    const message = await fn();
    revalidatePath(`/c/${slug}`, "layout");
    revalidatePath("/quest", "layout");
    return { ok: true, message };
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    console.error("[circle-admin]", e);
    return { ok: false, message: "Something went wrong. Try again." };
  }
}

export async function changeRoleAction(slug: string, userId: string, next: string): Promise<AdminResult> {
  return run(slug, async () => {
    const { me, circle } = await context(slug);
    const target = uuid.parse(userId);
    if (!ROLES.includes(next as Role)) throw new GameError("Unknown role.");
    const res = await setRole(circle.id, me, target, next as Role);
    const [p] = await db()<{ full_name: string; is_adult: boolean }[]>`select full_name, is_adult from quest_profiles where id = ${target}`;
    const name = p?.is_adult ? displayName(p.full_name) : "They";
    return res.changed ? `${name} ${p?.is_adult ? "is" : "are"} now ${next === "attendee" ? "an attendee" : `a ${roleLabel(next as Role)}`}.` : "No change.";
  });
}

export async function removePhotoAction(slug: string, userId: string): Promise<AdminResult> {
  return run(slug, async () => {
    await context(slug);
    return (await removePhoto(uuid.parse(userId))) ? "Photo removed. They now show their initials." : "They don't have a photo.";
  });
}

/* ---------- role invite links ---------- */

export type InviteResult = { ok: boolean; message: string; url?: string; qr?: string } | null;

/** The full link and its QR come back once: only a hash of the token is stored. */
export async function createInviteAction(slug: string, _: InviteResult, form: FormData): Promise<InviteResult> {
  try {
    const { me, circle, role } = await context(slug);
    const pick = String(form.get("role") ?? "");
    if (!(["speaker", "co_organiser", "organiser"] as const).includes(pick as StaffRole)) throw new GameError("Pick a role.");
    const { token } = await createRoleInvite(circle, me, role, {
      role: pick as StaffRole,
      maxUses: Number.parseInt(String(form.get("uses") ?? "1"), 10),
      days: Number.parseInt(String(form.get("days") ?? "7"), 10),
      note: String(form.get("note") ?? ""),
    });
    const url = `${await adminSiteUrl()}/c/${circle.slug}/r/${token}`;
    const qr = await QRCode.toDataURL(url, { margin: 1, width: 480, errorCorrectionLevel: "M" });
    revalidatePath(`/c/${slug}/admin`);
    return { ok: true, message: `${roleLabel(pick as Role)} link created. Copy or share it now: for safety it can't be shown again.`, url, qr };
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    console.error("[circle-admin]", e);
    return { ok: false, message: "Something went wrong. Try again." };
  }
}

export async function revokeInviteAction(slug: string, id: string): Promise<AdminResult> {
  return run(slug, async () => {
    const { circle, role } = await context(slug);
    await revokeRoleInvite(circle, role, uuid.parse(id));
    return "Link revoked. It stops working straight away.";
  });
}

/* ---------- partners ---------- */

/** Staff edit every field of any partner; a partner's managers only its public profile. */
async function partnerScope(slug: string, stationId: string) {
  const ctx = await context(slug, false);
  if (isStaff(ctx.role)) return { ...ctx, scope: "full" as const };
  if (await isPartnerManager(ctx.me.id, stationId)) return { ...ctx, scope: "public" as const };
  throw new GameError("You're not allowed to edit this partner.");
}

export async function savePartnerAction(slug: string, stationId: string, _: AdminResult, form: FormData): Promise<AdminResult> {
  return run(slug, async () => {
    const id = uuid.parse(stationId);
    const { me, scope } = await partnerScope(slug, id);
    if (scope === "full") {
      const parsed = parsePartnerFull(form);
      if (!parsed.ok) throw new GameError(parsed.message);
      await updatePartnerFull(id, parsed.data, me.id);
    } else {
      const parsed = parsePartnerPublic(form);
      if (!parsed.ok) throw new GameError(parsed.message);
      await updatePartnerPublic(id, parsed.data, me.id);
    }
    return "Saved. Players see the change now.";
  });
}

export async function addPartnerAction(slug: string, _: AdminResult, form: FormData): Promise<AdminResult> {
  return run(slug, async () => {
    const { me } = await context(slug);
    const name = String(form.get("name") ?? "").trim();
    if (name.length < 2 || name.length > 60) throw new GameError("Enter the partner's name (2 to 60 characters).");
    await addPartnerByName(name, me.id);
    return `Added ${name}. Fill in their profile below.`;
  });
}

export async function resetBoothAction(slug: string, stationId: string): Promise<AdminResult> {
  return run(slug, async () => {
    const { me } = await context(slug);
    await resetBoothCode(uuid.parse(stationId), me.id);
    return "New booth QR issued. Print it again; the old one no longer works.";
  });
}

export async function addManagerAction(slug: string, stationId: string, _: AdminResult, form: FormData): Promise<AdminResult> {
  return run(slug, async () => {
    const { me, role } = await context(slug);
    if (role !== "organiser") throw new GameError("Only organisers can add partner managers.");
    const name = await addManager(uuid.parse(stationId), String(form.get("email") ?? ""), me.id);
    return `${name} can now edit this partner's profile.`;
  });
}

export async function removeManagerAction(slug: string, stationId: string, userId: string): Promise<AdminResult> {
  return run(slug, async () => {
    const { role } = await context(slug);
    if (role !== "organiser") throw new GameError("Only organisers can remove partner managers.");
    await removeManager(uuid.parse(stationId), uuid.parse(userId));
    return "Manager removed.";
  });
}

/** Logo upload signature for staff, or for this partner's managers. */
export async function partnerLogoSignAction(slug: string, stationId: string): Promise<SignedUpload | { error: string }> {
  try {
    await partnerScope(slug, uuid.parse(stationId));
    if (!cloudinaryEnabled()) return { error: "Uploads aren't set up on the server yet." };
    return signUpload("partners", stationId);
  } catch (e) {
    return { error: e instanceof GameError ? e.message : "Not allowed." };
  }
}

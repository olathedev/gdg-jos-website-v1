"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getMe } from "@/lib/quest/auth";
import { removePhoto } from "@/lib/quest/circle-admin";
import { requireCircle, roleOf, setRole } from "@/lib/quest/circles";
import { GameError } from "@/lib/quest/game";
import { isStaff, ROLES, roleLabel, type Role } from "@/lib/quest/roles";
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

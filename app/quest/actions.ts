"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { completePendingCheckin, getMe, safeNext } from "@/lib/quest/auth";
import {
  answerQuiz,
  blockAgent,
  claimCommunity,
  claimFollow,
  GameError,
  meet,
  requestConnection,
  respondConnection,
  saveProfile,
  savePlayer,
  upsertAuthUser,
} from "@/lib/quest/game";
import { markAllSeen } from "@/lib/quest/celebrate";
import { cloudinaryEnabled, isOwnUpload, type SignedUpload, signUpload } from "@/lib/cloudinary";
import { POINTS } from "@/lib/quest/config";
import { claimPartnerFollow, claimPartnerVisit } from "@/lib/quest/partners";
import { answerRound, finishRound, startRound } from "@/lib/quest/stages";
import { createSession, destroySession, devLoginEnabled } from "@/lib/quest/session";
import { hasSocial, playerSchema, profileSchema, xPostId } from "@/lib/quest/validate";
import { submitXPost } from "@/lib/quest/x";

export type Result = { ok: boolean; message: string } | null;

const uuid = z.uuid();

async function agent() {
  const me = await getMe();
  if (!me?.onboarded_at) throw new GameError("Sign in to play.");
  return me;
}

/** Runs a game action, turning rule failures into a message for the screen. */
async function play(fn: () => Promise<string>): Promise<Result> {
  try {
    const message = await fn();
    revalidatePath("/quest", "layout");
    return { ok: true, message };
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    console.error("[quest]", e);
    return { ok: false, message: "Something went wrong. Try again." };
  }
}

/* ---------- sign-in ---------- */

export async function devLoginAction(form: FormData) {
  if (!devLoginEnabled()) throw new Error("Not available");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) redirect("/quest/auth/dev?error=email");
  const id = await upsertAuthUser(`dev:${email}`, email, name, String(form.get("ref") ?? "") || null);
  await createSession(id);
  const checkedIn = await completePendingCheckin(id);
  redirect(checkedIn ? "/quest/event" : (safeNext(String(form.get("next") ?? "")) ?? "/quest/home"));
}

export async function signOutAction() {
  await destroySession();
  redirect("/quest");
}

/* ---------- profile ---------- */

export async function saveProfileAction(_: Result, form: FormData): Promise<Result> {
  const me = await getMe();
  if (!me) redirect("/quest");
  const parsed = profileSchema.safeParse({
    full_name: String(form.get("full_name") ?? ""),
    stack: form.getAll("stack").map(String),
    github: String(form.get("github") ?? ""),
    linkedin: String(form.get("linkedin") ?? ""),
    x_handle: String(form.get("x_handle") ?? ""),
    instagram: String(form.get("instagram") ?? ""),
    whatsapp: String(form.get("whatsapp") ?? ""),
    is_adult: form.get("is_adult") === "on",
    listed: form.get("listed") === "on",
    share_whatsapp: form.get("share_whatsapp") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your details." };
  try {
    await saveProfile(me.id, parsed.data);
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    throw e;
  }
  revalidatePath("/quest", "layout");
  if (!me.onboarded_at) redirect("/quest/missions?welcome=1");
  return { ok: true, message: "Saved." };
}

/** Onboarding for the stage game: avatar, name, stack, fun fact. */
export async function savePlayerAction(_: Result, form: FormData): Promise<Result> {
  const me = await getMe();
  if (!me) redirect("/quest");
  const parsed = playerSchema.safeParse({
    full_name: String(form.get("full_name") ?? ""),
    avatar: String(form.get("avatar") ?? ""),
    stack: form.getAll("stack").map(String),
    fun_fact: String(form.get("fun_fact") ?? ""),
    github: String(form.get("github") ?? ""),
    linkedin: String(form.get("linkedin") ?? ""),
    x_handle: String(form.get("x_handle") ?? ""),
    instagram: String(form.get("instagram") ?? ""),
    whatsapp: String(form.get("whatsapp") ?? ""),
    share_whatsapp: form.get("share_whatsapp") === "on",
    hidden: form.get("hidden") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your details." };
  // A photo must be this adult player's own upload; otherwise only the preset avatars are allowed.
  if (parsed.data.avatar.startsWith("https://") && !(me.is_adult && isOwnUpload(parsed.data.avatar, "avatars", me.id))) {
    return { ok: false, message: "Pick an avatar." };
  }
  try {
    await savePlayer(me.id, parsed.data);
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    throw e;
  }
  revalidatePath("/quest", "layout");
  // A scan or link that sent them here to finish their card goes back where it came from.
  const next = safeNext(String(form.get("next") ?? ""));
  if (!me.onboarded_at || !me.avatar) redirect(next ?? "/quest/home?welcome=1");
  redirect(next ?? (hasSocial(me) ? "/quest/profile" : "/quest/home"));
}

/* ---------- stages ---------- */

const round = z.number().int().min(1).max(3);

export async function startRoundAction(r: number) {
  try {
    const me = await agent();
    return { ok: true as const, view: await startRound(me.id, round.parse(r)) };
  } catch (e) {
    if (e instanceof GameError) return { ok: false as const, message: e.message };
    console.error("[quest]", e);
    return { ok: false as const, message: "Something went wrong. Try again." };
  }
}

export async function answerRoundAction(r: number, itemId: string, choice: number) {
  try {
    const me = await agent();
    return { ok: true as const, ...(await answerRound(me.id, round.parse(r), uuid.parse(itemId), choice)) };
  } catch (e) {
    if (e instanceof GameError) return { ok: false as const, message: e.message, code: e.code };
    console.error("[quest]", e);
    return { ok: false as const, message: "Something went wrong." };
  }
}

export async function finishRoundAction(r: number) {
  const me = await agent();
  await finishRound(me.id, round.parse(r));
  revalidatePath("/quest", "layout");
}

/* ---------- people ---------- */

export type PadiResult = { ok: boolean; message: string; padi?: boolean } | null;

/** "Be my padi". padi is true when this made you padis (they had already asked you). */
export async function connectAction(otherId: string): Promise<PadiResult> {
  try {
    const me = await agent();
    const { padi } = await requestConnection(me, uuid.parse(otherId));
    revalidatePath("/quest", "layout");
    return { ok: true, message: padi ? "You're padis now." : "Request sent.", padi };
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    console.error("[quest]", e);
    return { ok: false, message: "Something went wrong. Try again." };
  }
}

export async function respondAction(otherId: string, accept: boolean): Promise<PadiResult> {
  try {
    const me = await agent();
    const { padi } = await respondConnection(me.id, uuid.parse(otherId), accept);
    revalidatePath("/quest", "layout");
    return { ok: true, message: accept ? "Connected." : "Request removed.", padi };
  } catch (e) {
    if (e instanceof GameError) return { ok: false, message: e.message };
    console.error("[quest]", e);
    return { ok: false, message: "Something went wrong. Try again." };
  }
}

/** The other person saw their "new padi" celebration. */
export async function padisSeenAction(otherIds: string[]) {
  const me = await agent();
  const ids = (Array.isArray(otherIds) ? otherIds : []).filter((x) => uuid.safeParse(x).success).slice(0, 50);
  await markAllSeen(me.id, ids);
}

export async function blockAction(otherId: string, report: boolean, reason: string) {
  return play(async () => {
    const me = await agent();
    await blockAgent(me.id, uuid.parse(otherId), report, String(reason ?? ""));
    return report ? "Blocked and reported. An organiser will review it." : "Blocked.";
  });
}

/* ---------- Level Up ---------- */

export async function answerAction(itemId: string, choice: number) {
  try {
    const me = await agent();
    const res = await answerQuiz(me.id, uuid.parse(itemId), Number(choice));
    return { ok: true as const, ...res };
  } catch (e) {
    if (e instanceof GameError) return { ok: false as const, message: e.message };
    console.error("[quest]", e);
    return { ok: false as const, message: "Couldn't send your answer. Try again." };
  }
}

/* ---------- missions ---------- */

export async function followAction(platform: string) {
  return play(async () => {
    const me = await agent();
    await claimFollow(me.id, platform);
    return "Followed.";
  });
}

export async function communityAction() {
  return play(async () => {
    const me = await agent();
    await claimCommunity(me.id);
    return `+${POINTS.community} points. Welcome to the GDG Jos community!`;
  });
}

export async function xPostAction(_: Result, form: FormData): Promise<Result> {
  return play(async () => {
    const me = await agent();
    const post = xPostId(String(form.get("url") ?? ""));
    if (!post) throw new GameError("Paste a link like x.com/you/status/123…");
    const res = await submitXPost(me, post.id, post.handle);
    return `Post counted. +${res.points}`;
  });
}

/* ---------- profile photo ---------- */

/** A signature to upload this player's photo to their own slot. Adults only. */
export async function avatarUploadAction(): Promise<SignedUpload | { error: string }> {
  const me = await getMe();
  if (!me) return { error: "Sign in to upload a photo." };
  if (!me.is_adult) return { error: "Photos are for players 18 and over. Pick an avatar instead." };
  if (!cloudinaryEnabled()) return { error: "Photo uploads aren't available yet." };
  return signUpload("avatars", me.id);
}

/* ---------- partners ---------- */

export async function partnerVisitAction(stationId: string) {
  return play(async () => {
    const me = await agent();
    const points = await claimPartnerVisit(me.id, uuid.parse(stationId));
    return points ? `+${points}` : "";
  });
}

export async function partnerFollowAction(stationId: string, platform: string) {
  return play(async () => {
    const me = await agent();
    await claimPartnerFollow(me.id, uuid.parse(stationId), platform);
    return "Followed.";
  });
}

/* ---------- event day ---------- */

export async function meetAction(token: string) {
  try {
    const me = await agent();
    if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) throw new GameError("That QR isn't a DevFest Quest code.");
    // No revalidate here: it would re-render this page as "already met" over the result.
    const res = await meet(me, token);
    return { ok: true as const, ...res };
  } catch (e) {
    if (e instanceof GameError) return { ok: false as const, message: e.message };
    console.error("[quest]", e);
    return { ok: false as const, message: "Something went wrong. Try again." };
  }
}

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
  upsertAuthUser,
} from "@/lib/quest/game";
import { createSession, destroySession, devLoginEnabled } from "@/lib/quest/session";
import { profileSchema, xPostId } from "@/lib/quest/validate";
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

/* ---------- people ---------- */

export async function connectAction(otherId: string) {
  return play(async () => {
    const me = await agent();
    await requestConnection(me, uuid.parse(otherId));
    return "Request sent.";
  });
}

export async function respondAction(otherId: string, accept: boolean) {
  return play(async () => {
    const me = await agent();
    await respondConnection(me.id, uuid.parse(otherId), accept);
    return accept ? "Connected." : "Request removed.";
  });
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
    return "We'll match your email against the member list.";
  });
}

export async function xPostAction(_: Result, form: FormData): Promise<Result> {
  return play(async () => {
    const me = await agent();
    const post = xPostId(String(form.get("url") ?? ""));
    if (!post) throw new GameError("Paste a link like x.com/you/status/123…");
    const res = await submitXPost(me, post.id, post.handle);
    return res.status === "counted" ? `Post counted. +${res.points}` : "Got it. We'll check it within 15 minutes.";
  });
}

/* ---------- event day ---------- */

export async function meetAction(token: string) {
  try {
    const me = await agent();
    if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) throw new GameError("That QR isn't an agent code.");
    // No revalidate here: it would re-render this page as "already met" over the result.
    const res = await meet(me, token);
    return { ok: true as const, ...res };
  } catch (e) {
    if (e instanceof GameError) return { ok: false as const, message: e.message };
    console.error("[quest]", e);
    return { ok: false as const, message: "Something went wrong. Try again." };
  }
}

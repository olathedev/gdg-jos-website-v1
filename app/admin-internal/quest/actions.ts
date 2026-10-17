"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/admin-internal/actions";
import { requireAdmin } from "@/lib/admin/auth";
import {
  addPartner,
  addRoundQuestion,
  markReportReviewed,
  matchCommunityMembers,
  removePartner,
  setRound,
  unassignRoundQuestion,
} from "@/lib/quest/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const uuid = /^[0-9a-f-]{36}$/i;

export async function communityImportAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const file = form.get("file");
  const pasted = String(form.get("emails") ?? "");
  let text = pasted;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return { ok: false, message: "That file is over 5 MB." };
    text += `\n${await file.text()}`;
  }
  if (!text.trim()) return { ok: false, message: "Upload the member CSV or paste emails." };
  const { emails, matched } = await matchCommunityMembers(text);
  revalidatePath("/admin-internal/quest");
  if (!emails) return { ok: false, message: "No email addresses found in that file." };
  return { ok: true, message: `Read ${emails} emails. Matched and paid ${matched} new ${matched === 1 ? "claim" : "claims"}.` };
}

export async function reviewReportAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const blocker = String(form.get("blocker") ?? "");
  const blocked = String(form.get("blocked") ?? "");
  if (!uuid.test(blocker) || !uuid.test(blocked)) return { ok: false, message: "Invalid report." };
  await markReportReviewed(blocker, blocked);
  revalidatePath("/admin-internal/quest");
  return { ok: true, message: "Marked reviewed." };
}

export async function roundAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const round = Number(form.get("round"));
  const op = form.get("op");
  if (![1, 2, 3].includes(round) || (op !== "open" && op !== "close")) return { ok: false, message: "Invalid round." };
  await setRound(round, op);
  revalidatePath("/admin-internal/quest");
  return { ok: true, message: op === "open" ? `Round ${round} is live.` : `Round ${round} closed.` };
}

export async function addPartnerAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) return { ok: false, message: "Enter the partner's name (2 to 60 characters)." };
  await addPartner(name);
  revalidatePath("/admin-internal/quest");
  return { ok: true, message: `Added ${name}.` };
}

export async function removePartnerAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!uuid.test(id)) return { ok: false, message: "Invalid partner." };
  const ok = await removePartner(id);
  revalidatePath("/admin-internal/quest");
  return ok ? { ok: true, message: "Removed." } : { ok: false, message: "Players already scanned this partner, so it stays." };
}

export async function addQuestionAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const round = Number(form.get("round"));
  const question = String(form.get("question") ?? "").trim();
  const options = [0, 1, 2, 3].map((i) => String(form.get(`option${i}`) ?? "").trim());
  const correct = Number(form.get("correct"));
  if (![1, 2, 3].includes(round)) return { ok: false, message: "Pick a round." };
  if (question.length < 5 || question.length > 200) return { ok: false, message: "Write the question (5 to 200 characters)." };
  if (options.some((o) => !o || o.length > 120)) return { ok: false, message: "Fill in all 4 answers (up to 120 characters each)." };
  if (new Set(options.map((o) => o.toLowerCase())).size < 4) return { ok: false, message: "The 4 answers must be different." };
  if (![0, 1, 2, 3].includes(correct)) return { ok: false, message: "Mark the right answer." };
  await addRoundQuestion(round, question, options, correct);
  revalidatePath("/admin-internal/quest");
  return { ok: true, message: `Added to Round ${round}.` };
}

export async function removeQuestionAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!uuid.test(id)) return { ok: false, message: "Invalid question." };
  await unassignRoundQuestion(id);
  revalidatePath("/admin-internal/quest");
  return { ok: true, message: "Removed from round." };
}

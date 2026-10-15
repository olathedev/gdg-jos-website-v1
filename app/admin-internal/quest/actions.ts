"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/admin-internal/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { markReportReviewed, matchCommunityMembers } from "@/lib/quest/admin";

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

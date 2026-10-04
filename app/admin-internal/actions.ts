"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminPath, attemptLogin, canRemove, destroySession, requireAdmin, type InvitableRole } from "@/lib/admin/auth";
import { acceptInvite, createInvite, InviteError, reissueInvite, removeMember } from "@/lib/admin/team";
import { db } from "@/lib/tickets/db";
import { sendTicketEmails } from "@/lib/tickets/email";
import { verifyAndFulfil } from "@/lib/tickets/fulfil";
import { getOrder, markEmailed } from "@/lib/tickets/orders";
import { PaystackError } from "@/lib/tickets/paystack";

export type ActionState = { ok: boolean; message: string } | null;

const refOk = (r: unknown): r is string => typeof r === "string" && /^DFJ26-[A-Z0-9-]{8,40}$/.test(r);

async function site() {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || password.length < 6 || password.length > 200) return { ok: false, message: "Enter your email and password." };
  const res = await attemptLogin(email, password);
  if (!res.ok) return { ok: false, message: res.error };
  redirect(`/${adminPath()}`);
}

export async function logoutAction() {
  await destroySession();
  redirect(`/${adminPath()}`);
}

/** Ask Paystack about a pending order again; issues tickets if it was paid. */
export async function recheckAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const reference = form.get("reference");
  if (!refOk(reference)) return { ok: false, message: "Invalid reference." };
  try {
    const order = await verifyAndFulfil(reference, await site());
    revalidatePath("/admin-internal");
    const status = order?.status ?? "pending";
    return {
      ok: status === "paid",
      message: status === "paid" ? "Paid. Tickets issued and emailed." : status === "failed" ? "Paystack reports this payment failed." : "Still not paid on Paystack.",
    };
  } catch (e) {
    if (e instanceof PaystackError) return { ok: false, message: "Paystack has no completed payment for this order." };
    return { ok: false, message: "Couldn't reach Paystack. Try again." };
  }
}

export async function resendAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const reference = form.get("reference");
  if (!refOk(reference)) return { ok: false, message: "Invalid reference." };
  const data = await getOrder(reference);
  if (!data || data.tickets.length === 0) return { ok: false, message: "This order has no tickets to send." };
  const sent = await sendTicketEmails(data.order, data.tickets, await site());
  if (sent) await markEmailed(data.order.id);
  revalidatePath("/admin-internal");
  return { ok: sent, message: sent ? "Tickets re-sent." : "Some emails failed to send. Check the email settings." };
}

export async function checkInAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("ticketId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { ok: false, message: "Invalid ticket." };
  const undo = form.get("undo") === "1";
  const sql = db();
  if (undo) await sql`update tickets set checked_in_at = null where id = ${id}`;
  else await sql`update tickets set checked_in_at = now() where id = ${id} and checked_in_at is null`;
  revalidatePath("/admin-internal");
  return { ok: true, message: undo ? "Check-in undone." : "Checked in." };
}

/* ---------- team ---------- */

export type InviteState = { ok: boolean; message: string; link?: string } | null;

export async function inviteAction(_: InviteState, form: FormData): Promise<InviteState> {
  const actor = await requireAdmin();
  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const role = String(form.get("role") ?? "") as InvitableRole;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Enter a valid email." };
  try {
    const token = await createInvite(actor, { email, name, role });
    revalidatePath("/admin-internal/team");
    return { ok: true, message: `Invite created for ${email}. Send them this link (valid 72 hours):`, link: `${await site()}/${adminPath()}/invite/${token}` };
  } catch (e) {
    if (e instanceof InviteError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function reissueAction(_: InviteState, form: FormData): Promise<InviteState> {
  const actor = await requireAdmin();
  try {
    const token = await reissueInvite(actor, String(form.get("id") ?? ""));
    revalidatePath("/admin-internal/team");
    return { ok: true, message: "New link (valid 72 hours):", link: `${await site()}/${adminPath()}/invite/${token}` };
  } catch (e) {
    if (e instanceof InviteError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function removeAction(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  try {
    const email = await removeMember(actor.role, canRemove, String(form.get("id") ?? ""), actor.email);
    revalidatePath("/admin-internal/team");
    return { ok: true, message: `${email} removed.` };
  } catch (e) {
    if (e instanceof InviteError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function acceptInviteAction(_: ActionState, form: FormData): Promise<ActionState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("confirm") ?? "")) return { ok: false, message: "The passwords don't match." };
  try {
    await acceptInvite(token, password);
    return { ok: true, message: "Password set." };
  } catch (e) {
    if (e instanceof InviteError) return { ok: false, message: e.message };
    throw e;
  }
}

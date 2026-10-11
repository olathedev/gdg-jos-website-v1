"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminPath, attemptLogin, canRemove, destroySession, requireAdmin, type InvitableRole } from "@/lib/admin/auth";
import { adminSiteUrl } from "@/lib/admin/site";
import { changeTicketTier, editTicketHolder, isMethod, issueManualOrder, ManualError, markPaidManually } from "@/lib/admin/manual";
import { acceptInvite, createInvite, InviteError, reissueInvite, removeMember } from "@/lib/admin/team";
import { db } from "@/lib/tickets/db";
import { sendTicketEmails } from "@/lib/tickets/email";
import { verifyAndFulfil } from "@/lib/tickets/fulfil";
import { getOrder, markEmailed } from "@/lib/tickets/orders";
import { PaystackError } from "@/lib/tickets/paystack";
import { attendeeSchema } from "@/lib/tickets/schema";
import { formatNaira, isTierId, tiers } from "@/lib/tickets/tiers";

export type ActionState = { ok: boolean; message: string } | null;

const refOk = (r: unknown): r is string => typeof r === "string" && /^DFJ26-[A-Z0-9-]{8,40}$/.test(r);

const site = adminSiteUrl;

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
      message: status === "paid" ? "Paid. Tickets issued." : status === "failed" ? "Paystack reports this payment failed." : "Still not paid on Paystack.",
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

/* ---------- manual actions ---------- */

export type IssueState = { ok: boolean; message: string; reference?: string; codes?: string[] } | null;

const uuidOk = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v);
/** Naira typed by an admin ("8,000" or "8000") → kobo, or null if it isn't a number. */
const nairaToKobo = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[,\s₦]/g, "") || "0");
  return Number.isFinite(n) && n >= 0 && n <= 10_000_000 ? Math.round(n * 100) : null;
};
const fail = (e: unknown): { ok: false; message: string } => {
  if (e instanceof ManualError) return { ok: false, message: e.message };
  throw e;
};

/** Issue tickets for someone who paid in cash / transfer / POS, or a complimentary ticket. */
export async function issueTicketsAction(_: IssueState, form: FormData): Promise<IssueState> {
  const admin = await requireAdmin();
  const tier = form.get("tier");
  const method = form.get("method");
  if (!isTierId(tier)) return { ok: false, message: "Pick a ticket type." };
  if (!isMethod(method)) return { ok: false, message: "Pick how they paid." };
  const amountKobo = method === "complimentary" ? 0 : nairaToKobo(form.get("amount"));
  if (amountKobo === null) return { ok: false, message: "Enter the amount paid in naira." };

  const buyer = attendeeSchema.safeParse({ name: form.get("buyer_name"), email: form.get("buyer_email") });
  if (!buyer.success) return { ok: false, message: "Enter the buyer's full name and a valid email." };
  const phone = String(form.get("buyer_phone") ?? "").trim() || null;
  if (phone && !/^\+?[0-9\s-]{7,20}$/.test(phone)) return { ok: false, message: "That phone number doesn't look right." };

  // Attendee rows; a blank row falls back to the buyer (handy for single tickets).
  const names = form.getAll("attendee_name").map(String);
  const emails = form.getAll("attendee_email").map(String);
  const seats = names.length || 1;
  if (seats % tiers[tier].seatsPerUnit !== 0 || seats > 20) return { ok: false, message: `${tiers[tier].name} needs ${tiers[tier].seatsPerUnit} people per ticket.` };
  const attendees = [];
  for (let i = 0; i < seats; i++) {
    const a = attendeeSchema.safeParse({ name: names[i]?.trim() || buyer.data.name, email: emails[i]?.trim() || buyer.data.email });
    if (!a.success) return { ok: false, message: `Check the name and email for ticket ${i + 1}.` };
    attendees.push(a.data);
  }
  if (new Set(attendees.map((a) => a.email)).size !== attendees.length) return { ok: false, message: "Each ticket needs its own email." };

  try {
    const { order, tickets } = await issueManualOrder({
      tier,
      amountKobo,
      buyer: { ...buyer.data, phone },
      attendees,
      by: { by: admin.email, method, note: String(form.get("note") ?? "").trim().slice(0, 300) },
    });
    const message = `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} issued${amountKobo ? ` for ${formatNaira(amountKobo)}` : ""}.`;
    revalidatePath("/admin-internal");
    return { ok: true, message, reference: order.reference, codes: tickets.map((t) => t.code) };
  } catch (e) {
    return fail(e);
  }
}

/** Pending/failed order that was settled outside Paystack. */
export async function markPaidAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const reference = form.get("reference");
  const method = form.get("method");
  if (!refOk(reference)) return { ok: false, message: "Invalid reference." };
  if (!isMethod(method) || method === "complimentary") return { ok: false, message: "Pick how they paid." };
  try {
    await markPaidManually(reference, { by: admin.email, method });
    revalidatePath("/admin-internal");
    return { ok: true, message: "Marked paid. Tickets issued." };
  } catch (e) {
    return fail(e);
  }
}

export async function upgradeTicketAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = form.get("ticketId");
  const tier = form.get("tier");
  const method = form.get("method");
  const extra = nairaToKobo(form.get("amount"));
  if (!uuidOk(id)) return { ok: false, message: "Invalid ticket." };
  if (!isTierId(tier)) return { ok: false, message: "Pick a ticket type." };
  if (!isMethod(method)) return { ok: false, message: "Pick how they paid." };
  if (extra === null) return { ok: false, message: "Enter the amount collected in naira." };
  try {
    await changeTicketTier(id, tier, method === "complimentary" ? 0 : extra, { by: admin.email, method });
    revalidatePath("/admin-internal");
    return { ok: true, message: `Now ${tiers[tier].name}.` };
  } catch (e) {
    return fail(e);
  }
}

export async function editHolderAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = form.get("ticketId");
  if (!uuidOk(id)) return { ok: false, message: "Invalid ticket." };
  const holder = attendeeSchema.safeParse({ name: form.get("name"), email: form.get("email") });
  if (!holder.success) return { ok: false, message: "Enter a full name and a valid email." };
  try {
    await editTicketHolder(id, holder.data.name, holder.data.email);
    revalidatePath("/admin-internal");
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
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

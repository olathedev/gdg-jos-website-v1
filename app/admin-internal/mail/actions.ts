"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { findTickets, isSegment, logMail, recipientsFor, segments, type FoundTicket } from "@/lib/admin/mail";
import { adminSiteUrl } from "@/lib/admin/site";
import { sendMail, sendMany } from "@/lib/mail/send";
import { renderMessage, renderText, safeUrl, type Message, type Recipient } from "@/lib/mail/template";
import { db } from "@/lib/tickets/db";
import { sendTicketTo } from "@/lib/tickets/email";
import { getOrder, type Ticket } from "@/lib/tickets/orders";

export type MailState = { ok: boolean; message: string; at: number } | null;

const done = (ok: boolean, message: string): MailState => ({ ok, message, at: Date.now() });
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const messageSchema = z
  .object({
    subject: z.string().trim().min(3, "Add a subject").max(150, "Keep the subject under 150 characters"),
    headline: z.string().trim().max(120, "Keep the headline under 120 characters").optional(),
    body: z.string().trim().min(10, "Write a message").max(10_000, "That message is too long"),
    ctaLabel: z.string().trim().max(40, "Keep the button label short").optional(),
    ctaUrl: z.string().trim().max(500).optional(),
  })
  .refine((m) => !m.ctaLabel || safeUrl(m.ctaUrl), { message: "The button needs a link starting with https://" });

const str = (form: FormData, k: string) => String(form.get(k) ?? "");

/** Compose + send. intent=test sends only to the signed-in admin. */
export async function sendMessageAction(_: MailState, form: FormData): Promise<MailState> {
  const admin = await requireAdmin();
  const parsed = messageSchema.safeParse({
    subject: str(form, "subject"),
    headline: str(form, "headline") || undefined,
    body: str(form, "body"),
    ctaLabel: str(form, "ctaLabel") || undefined,
    ctaUrl: str(form, "ctaUrl") || undefined,
  });
  if (!parsed.success) return done(false, parsed.error.issues[0].message);
  const msg: Message = parsed.data;
  const audience = str(form, "audience");

  let recipients: Recipient[];
  if (audience === "one") {
    const to = email.safeParse(str(form, "to"));
    if (!to.success) return done(false, "Enter a valid email address for the recipient.");
    recipients = [{ email: to.data, name: str(form, "toName").trim().slice(0, 80) || null }];
  } else if (isSegment(audience)) {
    recipients = await recipientsFor(audience);
  } else {
    return done(false, "Choose who to send to.");
  }

  // Test: one copy to yourself, personalised as the first real recipient.
  if (str(form, "intent") === "test") {
    const sample = recipients[0] ?? { email: admin.email, name: admin.name };
    try {
      await sendMail({ to: admin.email, subject: `[Test] ${msg.subject}`, html: renderMessage(msg, sample), text: renderText(msg, sample) });
      return done(true, `Test sent to ${admin.email}.`);
    } catch (e) {
      console.error(e);
      return done(false, "The test email didn't send. Check the Resend key and sender domain.");
    }
  }

  if (recipients.length === 0) return done(false, "Nobody in that audience yet.");
  if (recipients.length > 5000) return done(false, "That's more than 5,000 people. Split the send.");

  const { sent, failed } = await sendMany(
    recipients.map((r) => ({
      to: r.email,
      subject: msg.subject,
      html: renderMessage(msg, r, audience === "one" ? "Sent to you by the DevFest Jos team." : undefined),
      text: renderText(msg, r),
    })),
  );
  await logMail({
    kind: audience === "one" ? "individual" : "broadcast",
    audience: audience === "one" ? recipients[0].email : segments[audience as keyof typeof segments].label,
    subject: msg.subject,
    body: msg.body,
    recipients: recipients.length,
    sent,
    failed: failed.length,
    sent_by: admin.email,
  });
  revalidatePath("/admin-internal/mail");

  if (failed.length === 0) return done(true, sent === 1 ? `Sent to ${recipients[0].email}.` : `Sent to ${sent} people.`);
  if (sent === 0) return done(false, "Nothing was sent. Check the Resend key and sender domain.");
  return done(false, `Sent to ${sent}, but ${failed.length} failed. See the server log.`);
}

/* ---------- tickets ---------- */

export type FindState = { q: string; results: FoundTicket[] } | null;

export async function findTicketsAction(_: FindState, form: FormData): Promise<FindState> {
  await requireAdmin();
  const q = str(form, "q").trim().slice(0, 120);
  if (q.length < 3) return { q, results: [] };
  return { q, results: await findTickets(q) };
}

export async function sendTicketAction(_: MailState, form: FormData): Promise<MailState> {
  const admin = await requireAdmin();
  const id = str(form, "ticketId");
  if (!/^[0-9a-f-]{36}$/.test(id)) return done(false, "Invalid ticket.");

  const [row] = await db()<(Ticket & { reference: string })[]>`
    select t.id, t.code, t.tier, t.holder_name, t.holder_email, t.checked_in_at, o.reference
    from tickets t join orders o on o.id = t.order_id where t.id = ${id}`;
  if (!row) return done(false, "Ticket not found.");
  const data = await getOrder(row.reference);
  if (!data) return done(false, "Order not found.");

  const target = str(form, "to").trim() ? email.safeParse(str(form, "to")) : { success: true as const, data: row.holder_email };
  if (!target.success) return done(false, "Enter a valid email address.");

  try {
    await sendTicketTo(data.order, row, target.data, await adminSiteUrl());
  } catch (e) {
    console.error(e);
    return done(false, "Couldn't send. Check the Resend key and sender domain.");
  }
  await logMail({
    kind: "ticket",
    audience: target.data,
    subject: `Ticket ${row.code} (${row.holder_name})`,
    recipients: 1,
    sent: 1,
    failed: 0,
    sent_by: admin.email,
  });
  revalidatePath("/admin-internal/mail");
  return done(true, `Ticket sent to ${target.data}.`);
}

import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/tickets/db";
import type { Attendee, Order, Ticket } from "@/lib/tickets/orders";
import { tiers, type TierId } from "@/lib/tickets/tiers";

// Manual (off-Paystack) work done from the admin dashboard. There's no Paystack
// payload for these orders, so we keep a small record in the `paystack` column
// instead: `domain: "live"` keeps them in stats and lists, and `channel` shows
// up as the payment method in the order drawer.

export const methods = { cash: "Cash", transfer: "Bank transfer", pos: "POS", complimentary: "Complimentary" } as const;
export type Method = keyof typeof methods;
export const isMethod = (m: unknown): m is Method => typeof m === "string" && m in methods;

export class ManualError extends Error {}

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const randomCode = (n: number) => Array.from(randomBytes(n), (b) => ALPHABET[b % 32]).join("");
const ticketCode = () => {
  const c = randomCode(8);
  return `${c.slice(0, 4)}-${c.slice(4)}`;
};

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === "23505";
const regularTaken = () => new ManualError("That email already has a Regular ticket.");

type Note = { by: string; method: Method; note?: string };
const record = (n: Note) => ({ domain: "live", channel: n.method, manual: true, by: n.by, note: n.note || undefined, at: new Date().toISOString() });

/** Create a paid (or complimentary) order for someone who paid outside Paystack, and issue its tickets. */
export async function issueManualOrder(input: {
  tier: TierId;
  amountKobo: number;
  buyer: { name: string; email: string; phone: string | null };
  attendees: Attendee[];
  by: Note;
}) {
  const free = input.by.method === "complimentary" || input.amountKobo === 0;
  const sql = db();
  try {
    return await sql.begin(async (tx) => {
      const [order] = await tx<Order[]>`
        insert into orders (reference, tier, units, amount_kobo, status, buyer_name, buyer_email, buyer_phone, attendees, paystack, paid_at)
        values (${`DFJ26-${input.by.method === "complimentary" ? "COMP" : "CASH"}-${randomCode(12)}`}, ${input.tier},
                ${Math.max(1, Math.round(input.attendees.length / tiers[input.tier].seatsPerUnit))},
                ${free ? 0 : input.amountKobo}, ${free ? "free" : "paid"},
                ${input.buyer.name}, ${input.buyer.email}, ${input.buyer.phone}, ${tx.json(input.attendees)},
                ${tx.json(record(input.by))}, now())
        returning *`;
      const rows = input.attendees.map((a) => ({ code: ticketCode(), order_id: order.id, tier: order.tier, holder_name: a.name, holder_email: a.email }));
      const tickets = await tx<Ticket[]>`
        insert into tickets ${tx(rows)} returning id, code, tier, holder_name, holder_email, checked_in_at`;
      return { order, tickets };
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw regularTaken();
    throw e;
  }
}

/** A pending or failed order that was settled outside Paystack: mark it paid and issue its tickets. */
export async function markPaidManually(reference: string, by: Note) {
  return db().begin(async (tx) => {
    const [order] = await tx<Order[]>`select * from orders where reference = ${reference} for update`;
    if (!order) throw new ManualError("Order not found.");
    if (order.status === "paid" || order.status === "free") throw new ManualError("This order is already paid.");
    const [{ n }] = await tx<{ n: number }[]>`select count(*)::int as n from tickets where order_id = ${order.id}`;
    // Keep whatever Paystack told us, but add the manual record on top.
    const [paid] = await tx<Order[]>`
      update orders set status = 'paid', failure = null, paid_at = now(),
             paystack = coalesce(paystack, '{}'::jsonb) || ${tx.json(record(by))}
      where id = ${order.id} returning *`;
    if (n === 0) {
      const rows = order.attendees.map((a) => ({ code: ticketCode(), order_id: order.id, tier: order.tier, holder_name: a.name, holder_email: a.email }));
      await tx`insert into tickets ${tx(rows)}`;
    }
    return paid;
  });
}

/**
 * Move one ticket to another tier (e.g. Regular → VIP after the difference was
 * paid in cash). Any amount collected is added to the order's total.
 */
export async function changeTicketTier(ticketId: string, tier: TierId, extraKobo: number, by: Note) {
  try {
    return await db().begin(async (tx) => {
      const [t] = await tx<{ order_id: string; tier: TierId; code: string }[]>`
        select order_id, tier, code from tickets where id = ${ticketId} for update`;
      if (!t) throw new ManualError("Ticket not found.");
      if (t.tier === tier && extraKobo === 0) throw new ManualError(`This ticket is already ${tiers[tier].name}.`);
      await tx`update tickets set tier = ${tier} where id = ${ticketId}`;
      // If every ticket on the order now shares one tier, the order follows it.
      const [{ tiers: left }] = await tx<{ tiers: TierId[] }[]>`
        select array_agg(distinct tier) as tiers from tickets where order_id = ${t.order_id}`;
      const change = { ticket: t.code, from: t.tier, to: tier, amount_kobo: extraKobo, method: by.method, by: by.by, at: new Date().toISOString() };
      const [order] = await tx<Order[]>`
        update orders set
          tier = coalesce(${left.length === 1 ? left[0] : null}::text, tier),
          amount_kobo = amount_kobo + ${extraKobo},
          status = case when status = 'free' and ${extraKobo} > 0 then 'paid' else status end,
          paystack = jsonb_set(coalesce(paystack, '{"domain":"live"}'::jsonb), '{adjustments}',
                       coalesce(paystack->'adjustments', '[]'::jsonb) || ${tx.json([change])})
                     -- A free order had no payment method until now.
                     || jsonb_build_object('channel', coalesce(paystack->>'channel', ${extraKobo > 0 ? by.method : null}::text))
        where id = ${t.order_id} returning *`;
      return order;
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw regularTaken();
    throw e;
  }
}

/** Fix a typo in a holder's name or email, or hand the ticket to someone else. */
export async function editTicketHolder(ticketId: string, name: string, email: string) {
  try {
    const [t] = await db()<{ code: string }[]>`
      update tickets set holder_name = ${name}, holder_email = ${email} where id = ${ticketId} returning code`;
    if (!t) throw new ManualError("Ticket not found.");
    return t;
  } catch (e) {
    if (isUniqueViolation(e)) throw regularTaken();
    throw e;
  }
}

import "server-only";
import { randomBytes } from "node:crypto";
import type postgres from "postgres";
import { db } from "./db";
import type { CheckoutInput } from "./schema";
import type { PaystackTransaction } from "./paystack";
import { tiers, type TierId } from "./tiers";

export type OrderStatus = "pending" | "paid" | "free" | "failed";

export type Attendee = { name: string; email: string };

export type Order = {
  id: string;
  reference: string;
  tier: TierId;
  units: number;
  amount_kobo: number;
  currency: string;
  status: OrderStatus;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  attendees: Attendee[];
  failure: string | null;
  created_at: Date;
  paid_at: Date | null;
  emailed_at: Date | null;
};

export type Ticket = {
  id: string;
  code: string;
  tier: TierId;
  holder_name: string;
  holder_email: string;
  checked_in_at: Date | null;
};

export class AlreadyRegisteredError extends Error {}
export class SoldOutError extends Error {}

// Crockford base32: no I, L, O, U, so codes are easy to read out at the door.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function randomCode(length: number) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % 32]).join("");
}

const newReference = (free: boolean) => `DFJ26-${free ? "FREE-" : ""}${randomCode(16)}`;
const newTicketCode = () => {
  const c = randomCode(8);
  return `${c.slice(0, 4)}-${c.slice(4)}`;
};

type Tx = postgres.TransactionSql;

async function assertCapacity(sql: Tx, tierId: TierId, seats: number) {
  const cap = tiers[tierId].capacity;
  if (cap === null) return;
  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count from tickets where tier = ${tierId}`;
  if (count + seats > cap) throw new SoldOutError(`${tiers[tierId].name} tickets are sold out`);
}

async function issueTickets(sql: Tx, order: Order): Promise<Ticket[]> {
  const rows = order.attendees.map((a) => ({
    code: newTicketCode(),
    order_id: order.id,
    tier: order.tier,
    holder_name: a.name,
    holder_email: a.email,
  }));
  return await sql<Ticket[]>`
    insert into tickets ${sql(rows)}
    returning id, code, tier, holder_name, holder_email, checked_in_at`;
}

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === "23505";

/**
 * Create an order from validated checkout input. Free (Regular) orders are
 * fulfilled immediately; paid orders start as `pending` until Paystack confirms.
 */
export async function createOrder(input: CheckoutInput) {
  const sql = db();
  const tier = tiers[input.tier];
  const free = tier.priceKobo === 0;
  const seats = input.units * tier.seatsPerUnit;

  try {
    return await sql.begin(async (tx) => {
      await assertCapacity(tx, tier.id, seats);
      const [order] = await tx<Order[]>`
        insert into orders (reference, tier, units, amount_kobo, status, buyer_name, buyer_email, buyer_phone, attendees, paid_at)
        values (${newReference(free)}, ${tier.id}, ${input.units}, ${tier.priceKobo * input.units},
                ${free ? "free" : "pending"}, ${input.buyer.name}, ${input.buyer.email}, ${input.buyer.phone},
                ${tx.json(input.attendees)}, ${free ? tx`now()` : null})
        returning *`;
      const tickets = free ? await issueTickets(tx, order) : [];
      return { order, tickets };
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new AlreadyRegisteredError("This email already has a free ticket. Check your inbox.");
    throw e;
  }
}

/**
 * Mark a pending order paid from a *verified* Paystack transaction and issue its
 * tickets. Safe to call repeatedly (confirm page + webhook): only the first call
 * that flips the order to `paid` issues tickets and returns `fresh: true`.
 */
export async function fulfilPaidOrder(txn: PaystackTransaction) {
  return db().begin(async (tx) => {
    const [order] = await tx<Order[]>`select * from orders where reference = ${txn.reference} for update`;
    if (!order) return { order: null, fresh: false };
    if (order.status !== "pending") return { order, fresh: false };

    if (txn.status !== "success") {
      if (txn.status === "failed" || txn.status === "reversed") {
        const [failed] = await tx<Order[]>`
          update orders set status = 'failed', failure = ${`paystack_${txn.status}`}, paystack = ${tx.json(txn as never)}
          where id = ${order.id} returning *`;
        return { order: failed, fresh: false };
      }
      return { order, fresh: false }; // still in progress / abandoned: leave pending
    }

    if (txn.amount !== order.amount_kobo || txn.currency !== order.currency) {
      const [failed] = await tx<Order[]>`
        update orders set status = 'failed', failure = 'amount_mismatch', paystack = ${tx.json(txn as never)}
        where id = ${order.id} returning *`;
      return { order: failed, fresh: false };
    }

    const [paid] = await tx<Order[]>`
      update orders set status = 'paid', paid_at = coalesce(${txn.paid_at}::timestamptz, now()), paystack = ${tx.json(txn as never)}
      where id = ${order.id} returning *`;
    await issueTickets(tx, paid);
    return { order: paid, fresh: true };
  });
}

export async function getOrder(reference: string) {
  const sql = db();
  const [order] = await sql<Order[]>`select * from orders where reference = ${reference}`;
  if (!order) return null;
  const tickets = await sql<Ticket[]>`
    select id, code, tier, holder_name, holder_email, checked_in_at
    from tickets where order_id = ${order.id} order by created_at, code`;
  return { order, tickets };
}

export async function getTicket(code: string) {
  const [ticket] = await db()<Ticket[]>`
    select id, code, tier, holder_name, holder_email, checked_in_at from tickets where code = ${code}`;
  return ticket ?? null;
}

export async function markEmailed(orderId: string) {
  await db()`update orders set emailed_at = now() where id = ${orderId}`;
}

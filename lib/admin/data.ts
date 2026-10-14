import "server-only";
import { orderStatusFilter } from "./order-filters";
import { db } from "@/lib/tickets/db";
import type { OrderStatus } from "@/lib/tickets/orders";
import type { TierId } from "@/lib/tickets/tiers";

// Paystack stamps each transaction with domain "live" or "test".
const LIVE = `coalesce(o.paystack->>'domain', 'live') = 'live'`;

export type Stats = {
  revenueKobo: number;
  paidOrders: number;
  soldUnits: number;
  padiUnits: number;
  tickets: { total: number; vip: number; padi: number; regular: number; checkedIn: number };
};

export async function getStats(): Promise<Stats> {
  const sql = db();
  const [o] = await sql.unsafe<
    { revenue: string; paid: number; sold_units: number; padi_units: number }[]
  >(`
    select
      coalesce(sum(o.amount_kobo), 0) as revenue,
      count(*)::int as paid,
      coalesce(sum(o.units), 0)::int as sold_units,
      coalesce(sum(o.units) filter (where o.tier = 'padi'), 0)::int as padi_units
    from orders o
    where o.status = 'paid' and ${LIVE}`);
  const [t] = await sql.unsafe<{ total: number; vip: number; padi: number; regular: number; checked: number }[]>(`
    select
      count(*)::int as total,
      count(*) filter (where t.tier = 'vip')::int as vip,
      count(*) filter (where t.tier = 'padi')::int as padi,
      count(*) filter (where t.tier = 'regular')::int as regular,
      count(*) filter (where t.checked_in_at is not null)::int as checked
    from tickets t join orders o on o.id = t.order_id
    where o.status = 'paid' and ${LIVE}`);
  return {
    revenueKobo: Number(o.revenue),
    paidOrders: o.paid,
    soldUnits: o.sold_units,
    padiUnits: o.padi_units,
    tickets: { total: t.total, vip: t.vip, padi: t.padi, regular: t.regular, checkedIn: t.checked },
  };
}

export type AdminTicket = { id: string; code: string; tier: TierId; holder_name: string; holder_email: string; checked_in_at: string | null; merch: "shirt" | "tote" | null; shirt_size: string | null; shirt_color: string | null };
export type AdminOrder = {
  id: string;
  reference: string;
  tier: TierId;
  units: number;
  amount_kobo: number;
  status: OrderStatus;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  created_at: Date;
  paid_at: Date | null;
  emailed_at: Date | null;
  failure: string | null;
  mode: "live" | "test" | null;
  channel: string | null;
  tickets: AdminTicket[];
};

export type OrderFilters = { q?: string; status?: string; tier?: string; mode?: string; page?: number };
export const PAGE_SIZE = 25;

export async function listOrders(f: OrderFilters) {
  const sql = db();
  const q = f.q?.trim();
  const status = orderStatusFilter(f.status);
  const tier = ["vip", "padi", "regular"].includes(f.tier ?? "") ? f.tier! : null;
  const page = Math.max(1, f.page ?? 1);
  const like = q ? `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;

  const where = sql`
    where (${like}::text is null or o.reference ilike ${like} or o.buyer_name ilike ${like} or o.buyer_email ilike ${like}
           or exists (select 1 from tickets t where t.order_id = o.id and (t.holder_name ilike ${like} or t.holder_email ilike ${like} or t.code ilike ${like})))
      and o.status = ${status}
      and (${tier}::text is null or o.tier = ${tier})
      and coalesce(o.paystack->>'domain', 'live') = 'live'`; // test-mode payments are never shown

  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from orders o ${where}`;
  const rows = await sql<AdminOrder[]>`
    select o.id, o.reference, o.tier, o.units, o.amount_kobo, o.status, o.buyer_name, o.buyer_email, o.buyer_phone,
           o.created_at, o.paid_at, o.emailed_at, o.failure,
           o.paystack->>'domain' as mode, o.paystack->>'channel' as channel,
           coalesce((select json_agg(json_build_object('id', t.id, 'code', t.code, 'tier', t.tier, 'holder_name', t.holder_name,
                     'holder_email', t.holder_email, 'checked_in_at', t.checked_in_at,
                     'merch', a.details->>'merch', 'shirt_size', a.details->>'shirtSize', 'shirt_color', a.details->>'shirtColor') order by t.created_at)
                     from tickets t
                     left join lateral (select details from jsonb_array_elements(o.attendees) details
                       where lower(details->>'email') = lower(t.holder_email) limit 1) a on true
                     where t.order_id = o.id), '[]') as tickets
    from orders o ${where}
    order by o.created_at desc
    limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`;
  return { rows, count, page, pages: Math.max(1, Math.ceil(count / PAGE_SIZE)) };
}

export async function ticketsCsv() {
  const rows = await db()<Record<string, string>[]>`
    select t.code, t.tier, t.holder_name, t.holder_email,
           coalesce(a.details->>'merch', '') as merch,
           coalesce(a.details->>'shirtSize', '') as shirt_size,
           coalesce(a.details->>'shirtColor', '') as shirt_color,
           coalesce(to_char(t.checked_in_at at time zone 'Africa/Lagos', 'YYYY-MM-DD HH24:MI'), '') as checked_in,
           o.reference, o.status,
           o.buyer_name, o.buyer_email, coalesce(o.buyer_phone, '') as buyer_phone,
           (o.amount_kobo / 100)::text as order_amount_ngn,
           to_char(o.created_at at time zone 'Africa/Lagos', 'YYYY-MM-DD HH24:MI') as ordered_at
    from tickets t join orders o on o.id = t.order_id
    left join lateral (select details from jsonb_array_elements(o.attendees) details where lower(details->>'email') = lower(t.holder_email) limit 1) a on true
    where o.status = 'paid' and coalesce(o.paystack->>'domain', 'live') = 'live'
    order by o.created_at desc, t.created_at`;
  const cols = ["code", "tier", "holder_name", "holder_email", "merch", "shirt_size", "shirt_color", "checked_in", "reference", "status", "buyer_name", "buyer_email", "buyer_phone", "order_amount_ngn", "ordered_at"];
  // Quote every cell; neutralise spreadsheet formula injection.
  const cell = (v: string) => `"${String(v ?? "").replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

import "server-only";
import type postgres from "postgres";
import { db } from "@/lib/tickets/db";

// Door check-in for staff (volunteers included). Only what's needed at the door:
// name, tier, merch to hand over and check-in status. No order amounts, emails or phones.

export type CheckinTicket = {
  id: string;
  code: string;
  tier: string;
  name: string;
  merch: string | null;
  shirt: string | null;
  checkedInAt: string | null;
  checkedInBy: string | null;
};

export type CheckinResult =
  | { kind: "ok"; ticket: CheckinTicket }
  | { kind: "already"; ticket: CheckinTicket }
  | { kind: "invalid"; code: string };

/** "DFJ26:ABCD-1234", "abcd1234", "ABCD 1234" → "ABCD-1234", or null. */
export function normaliseCode(raw: string) {
  const s = raw.trim().toUpperCase().replace(/^DFJ26:/, "").replace(/[^0-9A-Z]/g, "");
  return /^[0-9A-Z]{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4)}` : null;
}

type Row = {
  id: string;
  code: string;
  tier: string;
  holder_name: string;
  checked_in_at: Date | null;
  checked_in_by: string | null;
  merch: string | null;
  shirt_size: string | null;
  shirt_color: string | null;
};

const select = (where: postgres.PendingQuery<postgres.Row[]>) => db()<Row[]>`
  select t.id, t.code, t.tier, t.holder_name, t.checked_in_at, t.checked_in_by,
         a.details->>'merch' as merch, a.details->>'shirtSize' as shirt_size, a.details->>'shirtColor' as shirt_color
  from tickets t
  join orders o on o.id = t.order_id and o.status in ('paid', 'free')
  left join lateral (select details from jsonb_array_elements(o.attendees) details
    where lower(details->>'email') = lower(t.holder_email) limit 1) a on true
  ${where}`;

const toTicket = (r: Row): CheckinTicket => ({
  id: r.id,
  code: r.code,
  tier: r.tier,
  name: r.holder_name,
  merch: r.merch,
  shirt: r.merch === "shirt" ? [r.shirt_size, r.shirt_color].filter(Boolean).join(" · ") || null : null,
  checkedInAt: r.checked_in_at ? new Date(r.checked_in_at).toISOString() : null,
  checkedInBy: r.checked_in_by,
});

/** Checks a ticket in, once. A second scan reports when and by whom it was first checked in. */
export async function checkInByCode(raw: string, by: string): Promise<CheckinResult> {
  const code = normaliseCode(raw);
  if (!code) return { kind: "invalid", code: raw.slice(0, 40) };
  const sql = db();
  // Only valid (paid or free) tickets; the update is atomic so two scanners can't both admit it.
  const updated = await sql<{ id: string }[]>`
    update tickets t set checked_in_at = now(), checked_in_by = ${by}
    from orders o
    where t.code = ${code} and o.id = t.order_id and o.status in ('paid', 'free') and t.checked_in_at is null
    returning t.id`;
  const [row] = await select(sql`where t.code = ${code}`);
  if (!row) return { kind: "invalid", code };
  return { kind: updated.length ? "ok" : "already", ticket: toTicket(row) };
}

export async function undoCheckIn(id: string) {
  await db()`update tickets set checked_in_at = null, checked_in_by = null where id = ${id}`;
}

/** For people without their QR: search by name, email or code. Returns door details only. */
export async function searchTickets(q: string) {
  const term = q.trim();
  if (term.length < 3) return [];
  const like = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await select(
    db()`where t.holder_name ilike ${like} or t.holder_email ilike ${like} or t.code ilike ${like}
         order by t.holder_name limit 8`,
  );
  return rows.map(toTicket);
}

export async function checkinStats() {
  const [s] = await db()<{ total: number; checked: number }[]>`
    select count(*)::int as total, count(t.checked_in_at)::int as checked
    from tickets t join orders o on o.id = t.order_id and o.status in ('paid', 'free')`;
  return s;
}

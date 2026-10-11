import "server-only";
import { db } from "@/lib/tickets/db";
import type { Recipient } from "@/lib/mail/template";

export const segments = {
  paid: { label: "Everyone paid", hint: "Buyers and ticket holders on paid orders" },
  vip: { label: "VIP", hint: "VIP buyers and holders" },
  padi: { label: "My Padi", hint: "My Padi buyers and holders" },
  buyers: { label: "Buyers only", hint: "The person who paid, once per email" },
} as const;
export type Segment = keyof typeof segments;
export const isSegment = (s: string): s is Segment => s in segments;

// Live, paid orders only. Test-mode Paystack payments are never mailed.
const PAID = `o.status = 'paid' and coalesce(o.paystack->>'domain', 'live') = 'live'`;

function audienceSql(segment: Segment) {
  const tier = segment === "vip" || segment === "padi" ? `and o.tier = '${segment}'` : "";
  const holders = `select t.holder_email as email, t.holder_name as name, t.created_at as at
                   from tickets t join orders o on o.id = t.order_id where ${PAID} ${tier}`;
  const buyers = `select o.buyer_email as email, o.buyer_name as name, o.created_at as at from orders o where ${PAID} ${tier}`;
  const union = segment === "buyers" ? buyers : `${holders} union all ${buyers}`;
  // One row per address; prefer the earliest name we saw for it.
  return `select distinct on (lower(email)) lower(email) as email, name from (${union}) a order by lower(email), at`;
}

export async function recipientsFor(segment: Segment): Promise<Recipient[]> {
  return db().unsafe<Recipient[]>(audienceSql(segment));
}

export async function audienceCounts(): Promise<Record<Segment, number>> {
  const keys = Object.keys(segments) as Segment[];
  const sql = db();
  const counts = await Promise.all(keys.map((k) => sql.unsafe<{ n: number }[]>(`select count(*)::int as n from (${audienceSql(k)}) x`)));
  return Object.fromEntries(keys.map((k, i) => [k, counts[i][0].n])) as Record<Segment, number>;
}

/* ---------- log ---------- */

export type MailKind = "broadcast" | "individual" | "ticket";
export type MailLogRow = {
  id: string;
  kind: MailKind;
  audience: string;
  subject: string;
  recipients: number;
  sent: number;
  failed: number;
  sent_by: string;
  created_at: Date;
};

let tableReady: Promise<unknown> | null = null;
function ensureMailTable() {
  tableReady ??= db().unsafe(`
    create table if not exists mail_log (
      id uuid primary key default gen_random_uuid(),
      kind text not null check (kind in ('broadcast', 'individual', 'ticket')),
      audience text not null,
      subject text not null,
      body text,
      recipients int not null default 0,
      sent int not null default 0,
      failed int not null default 0,
      sent_by text not null,
      created_at timestamptz not null default now()
    );
    create index if not exists mail_log_created_idx on mail_log (created_at desc);
    alter table mail_log enable row level security;
  `);
  return tableReady;
}

export async function logMail(row: Omit<MailLogRow, "id" | "created_at"> & { body?: string | null }) {
  await ensureMailTable();
  await db()`insert into mail_log ${db()({ ...row, body: row.body ?? null })}`;
}

export async function recentMail(limit = 20) {
  await ensureMailTable();
  return db()<MailLogRow[]>`
    select id, kind, audience, subject, recipients, sent, failed, sent_by, created_at
    from mail_log order by created_at desc limit ${limit}`;
}

/* ---------- ticket lookup ---------- */

export type FoundTicket = {
  id: string;
  code: string;
  tier: string;
  holder_name: string;
  holder_email: string;
  reference: string;
  status: string;
};

export async function findTickets(q: string) {
  const like = `%${q.trim().replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  return db()<FoundTicket[]>`
    select t.id, t.code, t.tier, t.holder_name, t.holder_email, o.reference, o.status
    from tickets t join orders o on o.id = t.order_id
    where coalesce(o.paystack->>'domain', 'live') = 'live'
      and (t.code ilike ${like} or t.holder_email ilike ${like} or t.holder_name ilike ${like}
           or o.reference ilike ${like} or o.buyer_email ilike ${like})
    order by t.created_at desc
    limit 12`;
}

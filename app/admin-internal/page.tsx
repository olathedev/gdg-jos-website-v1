import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDown, Download, LogOut, Search } from "lucide-react";
import { ActionButton, LoginForm } from "@/components/admin/AdminForms";
import { Logo } from "@/components/df26/ui";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { getStats, listOrders, type AdminOrder } from "@/lib/admin/data";
import { formatNaira, tiers } from "@/lib/tickets/tiers";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · DevFest Jos 2026", robots: { index: false, follow: false } };

type SP = Promise<{ q?: string; status?: string; tier?: string; mode?: string; page?: string }>;

const statusStyle: Record<string, string> = {
  paid: "bg-p-green text-[#0d652d]",
  free: "bg-p-blue text-[#174ea6]",
  pending: "bg-p-yellow text-[#8a4a00]",
  failed: "bg-p-red text-[#a50e0e]",
};

const dt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

export default async function AdminPage({ searchParams }: { searchParams: SP }) {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const admin = await currentAdmin();

  if (!admin) {
    return (
      <main className="grid min-h-svh place-items-center bg-paper px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Logo tone="dark" />
          </div>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-ink/10 sm:p-8">
            <h1 className="type-heading text-2xl">Admin sign in</h1>
            <p className="mt-1 mb-6 text-sm text-ink/60">Authorised organisers only.</p>
            <LoginForm />
          </div>
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  const [stats, list] = await Promise.all([
    getStats(),
    listOrders({ q: sp.q, status: sp.status, tier: sp.tier, page: Number(sp.page) || 1 }),
  ]);
  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  const cards = [
    { label: "Revenue", value: formatNaira(stats.revenueKobo), sub: `${stats.paidOrders} paid orders`, tone: "bg-g-blue text-white" },
    { label: "Tickets issued", value: String(stats.tickets.total), sub: `${stats.tickets.vip} VIP · ${stats.tickets.padi} My Padi`, tone: "bg-white" },
    { label: "Checked in", value: String(stats.tickets.checkedIn), sub: `of ${stats.tickets.total} tickets`, tone: "bg-white" },
    { label: "Needs attention", value: String(stats.pending), sub: `pending · ${stats.failed} failed`, tone: "bg-white" },
  ];

  const select = "h-11 rounded-xl bg-white px-3 text-sm ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-g-blue";

  return (
    <main className="min-h-svh bg-paper pb-20">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo tone="dark" />
            <span className="hidden rounded-full bg-ink/[0.06] px-2.5 py-1 text-xs font-semibold sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-ink/60 md:inline">{admin}</span>
            <form action={logoutAction}>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-medium ring-1 ring-ink/15 hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-g-blue">
                <LogOut aria-hidden className="size-4" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <h1 className="type-heading text-3xl">Ticket sales</h1>

        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <li key={c.label} className={`rounded-3xl p-5 ring-1 ring-ink/10 ${c.tone}`}>
              <p className="text-xs font-semibold tracking-[0.08em] uppercase opacity-70">{c.label}</p>
              <p className="type-heading mt-3 text-3xl sm:text-4xl">{c.value}</p>
              <p className="mt-1 text-xs opacity-70">{c.sub}</p>
            </li>
          ))}
        </ul>

        {/* Filters */}
        <form action={base} method="get" className="mt-10 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[16rem] flex-1">
            <span className="sr-only">Search</span>
            <Search aria-hidden className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/40" />
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Search name, email, reference or ticket code"
              className="h-11 w-full rounded-xl bg-white pr-3 pl-10 text-sm ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-g-blue"
            />
          </label>
          <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={select}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select name="tier" defaultValue={sp.tier ?? ""} aria-label="Ticket" className={select}>
            <option value="">All tickets</option>
            <option value="vip">VIP</option>
            <option value="padi">My Padi</option>
          </select>
          <button className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-g-blue">Apply</button>
          <a
            href={`${base}/export`}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-medium ring-1 ring-ink/15 hover:bg-white focus-visible:outline-2 focus-visible:outline-g-blue"
          >
            <Download aria-hidden className="size-4" /> Export CSV
          </a>
        </form>

        {/* Orders */}
        <div className="mt-4 overflow-hidden rounded-3xl bg-white ring-1 ring-ink/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs tracking-[0.06em] text-ink/55 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Buyer</th>
                  <th className="px-5 py-3 font-semibold">Ticket</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                </tr>
              </thead>
              {list.rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-ink/55">
                      No orders match these filters.
                    </td>
                  </tr>
                </tbody>
              ) : (
                list.rows.map((o) => <OrderRows key={o.id} o={o} />)
              )}
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-ink/60">
          <span>
            {list.count} order{list.count === 1 ? "" : "s"} · page {list.page} of {list.pages}
          </span>
          <div className="flex gap-2">
            {list.page > 1 && (
              <a href={qs({ page: list.page - 1 })} className="rounded-full px-4 py-2 ring-1 ring-ink/15 hover:bg-white">
                Previous
              </a>
            )}
            {list.page < list.pages && (
              <a href={qs({ page: list.page + 1 })} className="rounded-full px-4 py-2 ring-1 ring-ink/15 hover:bg-white">
                Next
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function OrderRows({ o }: { o: AdminOrder }) {
  return (
    <tbody className="group border-b border-ink/[0.06] last:border-0">
      <tr className="align-top [&>td]:pb-2">
        <td className="px-5 py-4 whitespace-nowrap text-ink/70">{dt.format(new Date(o.created_at))}</td>
        <td className="px-5 py-4">
          <p className="font-medium">{o.buyer_name}</p>
          <p className="text-xs text-ink/55">{o.buyer_email}</p>
          {o.buyer_phone && <p className="text-xs text-ink/55">{o.buyer_phone}</p>}
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          {tiers[o.tier].name} × {o.units}
          <p className="text-xs text-ink/55">
            {o.tickets.length} ticket{o.tickets.length === 1 ? "" : "s"}
          </p>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          {o.amount_kobo ? formatNaira(o.amount_kobo) : "Free"}
          {o.channel && <p className="text-xs text-ink/55 capitalize">{o.channel}</p>}
        </td>
        <td className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle[o.status]}`}>{o.status}</span>
          </div>
          {o.failure && <p className="mt-1 text-xs text-[#a50e0e]">{o.failure.replace(/_/g, " ")}</p>}
        </td>
        <td className="px-5 py-4 font-mono text-xs text-ink/60">{o.reference}</td>
      </tr>
      <tr>
        <td colSpan={6} className="px-5 pb-4">
          <details className="group/d [&_summary::-webkit-details-marker]:hidden">
            <summary className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-ink/15 hover:bg-paper focus-visible:outline-2 focus-visible:outline-g-blue">
              Manage <ChevronDown aria-hidden className="size-3.5 transition-transform group-open/d:rotate-180" />
            </summary>
            <div className="mt-3 max-w-3xl space-y-4 rounded-2xl bg-paper/60 p-4 text-sm ring-1 ring-ink/10">
              <div className="flex flex-wrap gap-2">
                {o.status === "pending" && <ActionButton kind="recheck" fields={{ reference: o.reference }} label="Re-check payment" tone="primary" />}
                {(o.status === "paid" || o.status === "free") && <ActionButton kind="resend" fields={{ reference: o.reference }} label="Resend tickets" />}
                {o.tickets.length > 0 && (
                  <>
                    <a href={`/tickets/order/${o.reference}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ring-1 ring-ink/15 hover:bg-paper">
                      View tickets
                    </a>
                    <a href={`/api/tickets/order/${o.reference}/pdf`} className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ring-1 ring-ink/15 hover:bg-paper">
                      PDF
                    </a>
                  </>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink/65">
                <dt>Paid at</dt>
                <dd>{o.paid_at ? dt.format(new Date(o.paid_at)) : "—"}</dd>
                <dt>Tickets emailed</dt>
                <dd>{o.emailed_at ? dt.format(new Date(o.emailed_at)) : "—"}</dd>
              </dl>
              {o.tickets.length > 0 && (
                <ul className="divide-y divide-ink/10 rounded-xl ring-1 ring-ink/10">
                  {o.tickets.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                      <div>
                        <p className="font-medium">{t.holder_name}</p>
                        <p className="text-xs text-ink/55">
                          {t.holder_email} · <span className="font-mono">{t.code}</span>
                        </p>
                      </div>
                      {t.checked_in_at ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-p-green px-2.5 py-0.5 text-xs font-semibold text-[#0d652d]">Checked in</span>
                          <ActionButton kind="checkin" fields={{ ticketId: t.id, undo: "1" }} label="Undo" tone="quiet" />
                        </div>
                      ) : (
                        <ActionButton kind="checkin" fields={{ ticketId: t.id }} label="Check in" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </td>
      </tr>
    </tbody>
  );
}

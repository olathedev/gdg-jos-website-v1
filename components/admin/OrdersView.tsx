"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Download, FileDown, Search, Ticket, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import type { AdminOrder } from "@/lib/admin/data";
import { formatNaira, tiers } from "@/lib/tickets/tiers";
import { ActionButton } from "./AdminForms";
import Dropdown from "./Dropdown";

const dt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });
const dtLong = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

export const statusMeta: Record<string, { label: string; pill: string; dot: string }> = {
  paid: { label: "Paid", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  pending: { label: "Pending", pill: "bg-amber-50 text-amber-700 ring-amber-600/15", dot: "bg-amber-500" },
  failed: { label: "Failed", pill: "bg-rose-50 text-rose-700 ring-rose-600/15", dot: "bg-rose-500" },
  free: { label: "Free", pill: "bg-sky-50 text-sky-700 ring-sky-600/15", dot: "bg-sky-500" },
};

const avatarTones = ["bg-blue-100 text-blue-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-800", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700"];
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
const toneFor = (s: string) => avatarTones[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length];

export function Avatar({ name, size = "size-9" }: { name: string; size?: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full text-xs font-semibold ${size} ${toneFor(name)}`}>{initials(name) || "?"}</span>;
}

function StatusPill({ status }: { status: string }) {
  const m = statusMeta[status] ?? statusMeta.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${m.pill}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function OrdersView({
  base,
  rows,
  count,
  page,
  pages,
}: {
  base: string;
  rows: AdminOrder[];
  count: number;
  page: number;
  pages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [openRef, setOpenRef] = useState<string | null>(null);
  const open = rows.find((r) => r.reference === openRef) ?? null;

  const setParam = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) (v ? p.set(k, v) : p.delete(k));
    if (!("page" in patch)) p.delete("page");
    const s = p.toString();
    start(() => router.push(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  };

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setParam({ q: String(new FormData(e.currentTarget).get("q") ?? "").trim() || null });
  };

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-sm text-zinc-500">
            {count} order{count === 1 ? "" : "s"}
            {pending && " · updating…"}
          </p>
        </div>
        <a
          href={`${base}/export`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-g-blue"
        >
          <Download aria-hidden className="size-4" /> Export CSV
        </a>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form onSubmit={onSearch} className="relative min-w-[15rem] flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            defaultValue={params.get("q") ?? ""}
            placeholder="Search name, email, reference or ticket code"
            aria-label="Search orders"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pr-3 pl-10 text-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
          />
        </form>
        <Dropdown
          label="Status"
          value={params.get("status") ?? ""}
          onChange={(v) => setParam({ status: v || null })}
          options={[
            { value: "", label: "All" },
            { value: "paid", label: "Paid", dot: statusMeta.paid.dot },
            { value: "pending", label: "Pending", dot: statusMeta.pending.dot },
            { value: "failed", label: "Failed", dot: statusMeta.failed.dot },
          ]}
        />
        <Dropdown
          label="Ticket"
          value={params.get("tier") ?? ""}
          onChange={(v) => setParam({ tier: v || null })}
          align="right"
          options={[
            { value: "", label: "All" },
            { value: "vip", label: "VIP", dot: "bg-sky-400" },
            { value: "padi", label: "My Padi", dot: "bg-emerald-400" },
          ]}
        />
      </div>

      {/* Table */}
      <div className={`mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-opacity ${pending ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50/60 text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Ticket</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center">
                    <Ticket aria-hidden className="mx-auto size-8 text-zinc-300" />
                    <p className="mt-3 font-medium">No orders here yet</p>
                    <p className="mt-1 text-sm text-zinc-500">Try a different search or filter.</p>
                  </td>
                </tr>
              )}
              {rows.map((o) => (
                <tr key={o.id} onClick={() => setOpenRef(o.reference)} className="cursor-pointer transition-colors hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={o.buyer_name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{o.buyer_name}</p>
                        <p className="truncate text-xs text-zinc-500">{o.buyer_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-medium">
                      {tiers[o.tier].name} <span className="text-zinc-400">×{o.units}</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {o.tickets.length} ticket{o.tickets.length === 1 ? "" : "s"}
                      {o.tickets.some((t) => t.checked_in_at) && ` · ${o.tickets.filter((t) => t.checked_in_at).length} in`}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 font-medium whitespace-nowrap tabular-nums">{o.amount_kobo ? formatNaira(o.amount_kobo) : "Free"}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-zinc-500">{dt.format(new Date(o.created_at))}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRef(o.reference);
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-g-blue"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-sm text-zinc-500">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setParam({ page: String(page - 1) })}
                aria-label="Previous page"
                className="grid size-9 place-items-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setParam({ page: String(page + 1) })}
                aria-label="Next page"
                className="grid size-9 place-items-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {open && <OrderDrawer o={open} onClose={() => setOpenRef(null)} />}
    </section>
  );
}

function OrderDrawer({ o, onClose }: { o: AdminOrder; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const checked = o.tickets.filter((t) => t.checked_in_at).length;
  const row = (k: string, v: React.ReactNode) => (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-zinc-500">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Order ${o.reference}`}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar name={o.buyer_name} size="size-11" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{o.buyer_name}</p>
              <p className="truncate text-sm text-zinc-500">{o.buyer_email}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-g-blue"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 text-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-zinc-500">
                {tiers[o.tier].name} × {o.units}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{o.amount_kobo ? formatNaira(o.amount_kobo) : "Free"}</p>
            </div>
            <StatusPill status={o.status} />
          </div>

          <div className="flex flex-wrap gap-2">
            {o.status === "pending" && <ActionButton kind="recheck" fields={{ reference: o.reference }} label="Re-check payment" tone="primary" />}
            {(o.status === "paid" || o.status === "free") && <ActionButton kind="resend" fields={{ reference: o.reference }} label="Resend tickets" />}
            {o.tickets.length > 0 && (
              <>
                <a href={`/tickets/order/${o.reference}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-50">
                  View tickets <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
                <a href={`/api/tickets/order/${o.reference}/pdf`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-50">
                  <FileDown aria-hidden className="size-3.5" /> PDF
                </a>
              </>
            )}
          </div>

          <dl className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 px-4">
            {row("Reference", <span className="font-mono text-xs">{o.reference}</span>)}
            {row("Phone", o.buyer_phone ?? "—")}
            {row("Ordered", dtLong.format(new Date(o.created_at)))}
            {row("Paid", o.paid_at ? dtLong.format(new Date(o.paid_at)) : "—")}
            {row("Payment method", <span className="capitalize">{o.channel ?? "—"}</span>)}
            {row("Tickets emailed", o.emailed_at ? dtLong.format(new Date(o.emailed_at)) : "—")}
            {o.failure && row("Failure", <span className="text-rose-600">{o.failure.replace(/_/g, " ")}</span>)}
          </dl>

          {o.tickets.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold">Tickets</p>
                <p className="text-xs text-zinc-500">
                  {checked}/{o.tickets.length} checked in
                </p>
              </div>
              <ul className="space-y-2">
                {o.tickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.holder_name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        <span className="font-mono">{t.code}</span> · {t.holder_email}
                      </p>
                    </div>
                    {t.checked_in_at ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15 ring-inset">Checked in</span>
                        <ActionButton kind="checkin" fields={{ ticketId: t.id, undo: "1" }} label="Undo" tone="quiet" />
                      </div>
                    ) : (
                      <ActionButton kind="checkin" fields={{ ticketId: t.id }} label="Check in" tone="primary" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

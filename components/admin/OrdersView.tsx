"use client";

import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Crown02Icon,
  Download04Icon,
  File02Icon,
  HourglassIcon,
  Search01Icon,
  Tick02Icon,
  Ticket02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { AdminOrder } from "@/lib/admin/data";
import { formatNaira, tiers } from "@/lib/tickets/tiers";
import { ActionButton } from "./AdminForms";
import Dropdown from "./Dropdown";
import Icon, { type IconData } from "./Icon";

const dtLong = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
const hm = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });
const ymd = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

export const statusMeta: Record<string, { label: string; pill: string; dot: string; icon: IconData }> = {
  paid: { label: "Paid", pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", icon: CheckmarkCircle02Icon },
  pending: { label: "Pending", pill: "bg-fuchsia-50 text-fuchsia-700", dot: "bg-fuchsia-500", icon: HourglassIcon },
  failed: { label: "Failed", pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500", icon: Alert02Icon },
  free: { label: "Free", pill: "bg-sky-50 text-sky-700", dot: "bg-sky-500", icon: Ticket02Icon },
};

const tierMeta = {
  vip: { label: "VIP", pill: "bg-sky-50 text-sky-700", icon: Crown02Icon },
  padi: { label: "My Padi", pill: "bg-emerald-50 text-emerald-700", icon: UserGroupIcon },
  regular: { label: "Regular", pill: "bg-zinc-100 text-zinc-700", icon: Ticket02Icon },
} as const;

function Pill({ icon, className, children }: { icon: IconData; className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap ${className}`}>
      <Icon icon={icon} className="size-3.5" strokeWidth={2} />
      {children}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const m = statusMeta[status] ?? statusMeta.pending;
  return (
    <Pill icon={m.icon} className={m.pill}>
      {m.label}
    </Pill>
  );
}

function TierPill({ tier, units }: { tier: keyof typeof tierMeta; units: number }) {
  const m = tierMeta[tier];
  return (
    <Pill icon={m.icon} className={m.pill}>
      {m.label}
      {units > 1 && <span className="opacity-60">×{units}</span>}
    </Pill>
  );
}

/** Copy-to-clipboard button that flips to a tick. */
function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(value).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        });
      }}
      className="grid size-6 shrink-0 place-items-center rounded-md text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-ink focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-g-blue group-hover/row:opacity-100"
    >
      <Icon icon={done ? Tick02Icon : Copy01Icon} className={`size-3.5 ${done ? "text-emerald-600" : ""}`} />
    </button>
  );
}

export default function OrdersView({ base, rows, count, page, pages }: { base: string; rows: AdminOrder[]; count: number; page: number; pages: number }) {
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
    <section className="mt-12">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-lg font-semibold">
          Orders <span className="ml-1 text-sm font-normal text-zinc-400">{count}</span>
          {pending && <span className="ml-2 text-sm font-normal text-zinc-400">updating…</span>}
        </h2>
        <form onSubmit={onSearch} className="relative w-full sm:w-80">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-400">
            <Icon icon={Search01Icon} className="size-4" />
          </span>
          <input
            name="q"
            defaultValue={params.get("q") ?? ""}
            placeholder="Search name, email, reference or code"
            aria-label="Search orders"
            className="h-10 w-full rounded-full border border-zinc-200 bg-white pr-4 pl-10 text-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
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
        <a
          href={`${base}/export`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-g-blue"
        >
          <Icon icon={Download04Icon} className="size-4 text-zinc-500" /> Export
        </a>
      </div>

      <div className={`mt-5 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-opacity ${pending ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="text-[13px] text-zinc-500">
              <tr className="border-b border-zinc-100">
                <th className="px-5 py-3.5 font-normal">Customer</th>
                <th className="px-4 py-3.5 font-normal">Email</th>
                <th className="px-4 py-3.5 font-normal">Phone number</th>
                <th className="px-4 py-3.5 font-normal">Ticket</th>
                <th className="px-4 py-3.5 font-normal">Amount</th>
                <th className="px-4 py-3.5 font-normal">Status</th>
                <th className="px-4 py-3.5 font-normal">Reference</th>
                <th className="px-5 py-3.5 font-normal">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <span className="mx-auto block w-fit text-zinc-300">
                      <Icon icon={Ticket02Icon} className="size-9" />
                    </span>
                    <p className="mt-3 font-medium">No orders here yet</p>
                    <p className="mt-1 text-sm text-zinc-500">Try a different search or filter.</p>
                  </td>
                </tr>
              )}
              {rows.map((o) => (
                <tr
                  key={o.id}
                  tabIndex={0}
                  onClick={() => setOpenRef(o.reference)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenRef(o.reference);
                    }
                  }}
                  aria-label={`Open order from ${o.buyer_name}`}
                  className="group/row cursor-pointer transition-colors outline-none hover:bg-zinc-50/80 focus-visible:bg-zinc-50"
                >
                  <td className="px-5 py-4">
                    <span className="block max-w-[12rem] truncate font-medium">{o.buyer_name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-zinc-600">
                      <span className="max-w-[14rem] truncate">{o.buyer_email}</span>
                      <CopyBtn value={o.buyer_email} label="email" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {o.buyer_phone ? (
                      <div className="flex items-center gap-1 whitespace-nowrap text-zinc-600 tabular-nums">
                        {o.buyer_phone}
                        <CopyBtn value={o.buyer_phone} label="phone number" />
                      </div>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <TierPill tier={o.tier} units={o.units} />
                  </td>
                  <td className="px-4 py-4 font-medium whitespace-nowrap tabular-nums">{o.amount_kobo ? formatNaira(o.amount_kobo) : "Free"}</td>
                  <td className="px-4 py-4">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 font-mono text-xs whitespace-nowrap text-zinc-500">
                      {o.reference.replace(/^DFJ26-/, "")}
                      <CopyBtn value={o.reference} label="reference" />
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="tabular-nums">{ymd(o.created_at)}</span>
                    <span className="ml-2 text-xs text-zinc-400">{hm.format(new Date(o.created_at))}</span>
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
              {[
                { label: "Previous page", icon: ArrowLeft01Icon, to: page - 1, disabled: page <= 1 },
                { label: "Next page", icon: ArrowRight01Icon, to: page + 1, disabled: page >= pages },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  disabled={b.disabled}
                  onClick={() => setParam({ page: String(b.to) })}
                  aria-label={b.label}
                  className="grid size-9 place-items-center rounded-full border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
                >
                  <Icon icon={b.icon} className="size-4" />
                </button>
              ))}
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
  const row = (k: string, v: ReactNode) => (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-zinc-500">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
  const linkBtn = "inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-xs font-medium hover:bg-zinc-50";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Order ${o.reference}`}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="min-w-0">
            <p className="truncate font-semibold">{o.buyer_name}</p>
            <p className="truncate text-sm text-zinc-500">{o.buyer_email}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-g-blue"
          >
            <Icon icon={Cancel01Icon} className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 text-sm">
          <div className="flex items-end justify-between">
            <div>
              <TierPill tier={o.tier} units={o.units} />
              <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{o.amount_kobo ? formatNaira(o.amount_kobo) : "Free"}</p>
            </div>
            <StatusPill status={o.status} />
          </div>

          <div className="flex flex-wrap gap-2">
            {o.status === "pending" && <ActionButton kind="recheck" fields={{ reference: o.reference }} label="Re-check payment" tone="primary" />}
            {(o.status === "paid" || o.status === "free") && <ActionButton kind="resend" fields={{ reference: o.reference }} label="Resend tickets" />}
            {o.tickets.length > 0 && (
              <>
                <a href={`/tickets/order/${o.reference}`} target="_blank" rel="noopener noreferrer" className={linkBtn}>
                  View tickets <Icon icon={ArrowUpRight01Icon} className="size-3.5" />
                </a>
                <a href={`/api/tickets/order/${o.reference}/pdf`} className={linkBtn}>
                  <Icon icon={File02Icon} className="size-3.5" /> PDF
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
                        <Pill icon={CheckmarkCircle02Icon} className="bg-emerald-50 text-emerald-700">
                          Checked in
                        </Pill>
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

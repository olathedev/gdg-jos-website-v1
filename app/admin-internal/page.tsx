import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, ScanLine, Ticket, Wallet } from "lucide-react";
import { LoginForm } from "@/components/admin/AdminForms";
import OrdersView from "@/components/admin/OrdersView";
import UserMenu from "@/components/admin/UserMenu";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { getStats, listOrders } from "@/lib/admin/data";
import { formatNaira } from "@/lib/tickets/tiers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · DevFest Jos 2026", robots: { index: false, follow: false } };

type SP = Promise<{ q?: string; status?: string; tier?: string; page?: string }>;

function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
      <span>
        <span className="text-g-blue">{"{"}</span>
        <span className="px-0.5">DevFest</span>
        <span className="text-g-yellow">{"}"}</span>
      </span>
      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600">Admin</span>
    </span>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: SP }) {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const admin = await currentAdmin();

  if (!admin) {
    return (
      <main className="grid min-h-svh place-items-center bg-white px-4 font-sans text-ink">
        <div className="w-full max-w-[22rem]">
          <div className="mb-8 flex justify-center">
            <Wordmark />
          </div>
          <h1 className="text-center text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 mb-8 text-center text-sm text-zinc-500">Sign in with your organiser email and PIN.</p>
          <LoginForm />
          <p className="mt-8 text-center text-xs text-zinc-400">Authorised DevFest Jos organisers only.</p>
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  const [stats, list] = await Promise.all([getStats(), listOrders({ q: sp.q, status: sp.status, tier: sp.tier, page: Number(sp.page) || 1 })]);

  const cards = [
    { label: "Revenue", value: formatNaira(stats.revenueKobo), sub: `${stats.paidOrders} paid order${stats.paidOrders === 1 ? "" : "s"}`, icon: Wallet, tone: "bg-blue-50 text-blue-600" },
    { label: "Tickets sold", value: String(stats.tickets.total), sub: `${stats.tickets.vip} VIP · ${stats.tickets.padi} My Padi`, icon: Ticket, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Checked in", value: String(stats.tickets.checkedIn), sub: `of ${stats.tickets.total} attendees`, icon: ScanLine, tone: "bg-violet-50 text-violet-600" },
    { label: "Needs attention", value: String(stats.pending), sub: `pending · ${stats.failed} failed`, icon: AlertCircle, tone: "bg-amber-50 text-amber-600" },
  ];
  const first = admin.split("@")[0].split(/[._-]/)[0];

  return (
    <div className="min-h-svh bg-white font-sans text-ink">
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Wordmark />
          <UserMenu email={admin} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
        <p className="text-sm text-zinc-500">Hi {first.charAt(0).toUpperCase() + first.slice(1)} 👋</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ticket sales</h1>

        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map(({ label, value, sub, icon: Icon, tone }) => (
            <li key={label} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{label}</p>
                <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>
                  <Icon aria-hidden className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-[28px]">{value}</p>
              <p className="mt-1 text-xs text-zinc-500">{sub}</p>
            </li>
          ))}
        </ul>

        <OrdersView base={base} rows={list.rows} count={list.count} page={list.page} pages={list.pages} />
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/admin/AdminForms";
import OrdersView from "@/components/admin/OrdersView";
import UserMenu from "@/components/admin/UserMenu";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { getStats, listOrders } from "@/lib/admin/data";
import { formatNaira } from "@/lib/tickets/tiers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · DevFest Jos 2026", robots: { index: false, follow: false } };

type SP = Promise<{ q?: string; status?: string; tier?: string; page?: string }>;

/** A slim slice of the DevFest shapes strip along the very top edge. */
function TopStrip() {
  return <div aria-hidden className="h-3 w-full bg-[#0a2914] bg-[url(/divider.svg)] bg-[length:auto_82px] bg-[position:center_-34px] bg-repeat-x sm:h-4" />;
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
      <span>
        <span className="text-g-blue">{"{"}</span>
        <span className="px-0.5">DevFest</span>
        <span className="text-g-yellow">{"}"}</span>
      </span>
      <span className="text-sm font-medium text-zinc-400">Jos &apos;26 · Admin</span>
    </span>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: SP }) {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const admin = await currentAdmin();

  if (!admin) {
    return (
      <div className="flex min-h-svh flex-col bg-white font-sans text-ink">
        <TopStrip />
        <main className="grid flex-1 place-items-center px-4">
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
      </div>
    );
  }

  const sp = await searchParams;
  const [stats, list] = await Promise.all([getStats(), listOrders({ q: sp.q, status: sp.status, tier: sp.tier, page: Number(sp.page) || 1 })]);

  const figures = [
    { label: "Revenue", value: formatNaira(stats.revenueKobo), sub: `${stats.paidOrders} paid order${stats.paidOrders === 1 ? "" : "s"}` },
    { label: "Tickets sold", value: String(stats.tickets.total), sub: `${stats.tickets.vip} VIP · ${stats.tickets.padi} My Padi` },
    { label: "Checked in", value: String(stats.tickets.checkedIn), sub: `of ${stats.tickets.total} attendees` },
    { label: "Pending", value: String(stats.pending), sub: `${stats.failed} failed` },
  ];

  return (
    <div className="min-h-svh bg-white font-sans text-ink">
      <TopStrip />
      <header className="border-b border-zinc-100">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-10">
          <Wordmark />
          <UserMenu email={admin} />
        </div>
      </header>

      <main className="px-5 pt-10 pb-20 sm:px-8 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight">Ticket sales</h1>

        {/* Figures: a plain row, no cards */}
        <dl className="mt-8 grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x lg:divide-zinc-100">
          {figures.map((f, i) => (
            <div key={f.label} className={`pr-6 ${i > 0 ? "lg:pl-8" : ""}`}>
              <dt className="text-sm text-zinc-500">{f.label}</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{f.value}</dd>
              <dd className="mt-1.5 text-sm text-zinc-400">{f.sub}</dd>
            </div>
          ))}
        </dl>

        <OrdersView base={base} rows={list.rows} count={list.count} page={list.page} pages={list.pages} />
      </main>
    </div>
  );
}

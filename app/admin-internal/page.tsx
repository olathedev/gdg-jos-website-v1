import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HourglassIcon, Money03Icon, Ticket02Icon, UserCheck01Icon } from "@hugeicons/core-free-icons";
import { LoginForm } from "@/components/admin/AdminForms";
import Icon from "@/components/admin/Icon";
import OrdersView from "@/components/admin/OrdersView";
import { AdminChrome, TopStrip, Wordmark } from "@/components/admin/Chrome";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { getStats, listOrders } from "@/lib/admin/data";
import { formatNaira } from "@/lib/tickets/tiers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · DevFest Jos 2026", robots: { index: false, follow: false } };

type SP = Promise<{ q?: string; status?: string; tier?: string; page?: string }>;

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
    { label: "Revenue", icon: Money03Icon, tint: "group-hover:text-blue-100", value: formatNaira(stats.revenueKobo), sub: `${stats.paidOrders} paid order${stats.paidOrders === 1 ? "" : "s"}` },
    { label: "Tickets sold", icon: Ticket02Icon, tint: "group-hover:text-emerald-100", value: String(stats.tickets.total), sub: `${stats.tickets.vip} VIP · ${stats.tickets.padi} My Padi` },
    { label: "Checked in", icon: UserCheck01Icon, tint: "group-hover:text-violet-100", value: String(stats.tickets.checkedIn), sub: `of ${stats.tickets.total} attendees` },
    { label: "Pending", icon: HourglassIcon, tint: "group-hover:text-yellow-100", value: String(stats.pending), sub: `${stats.failed} failed` },
  ];

  return (
    <AdminChrome base={base} user={admin} active="sales">
        <h1 className="text-2xl font-semibold tracking-tight">Ticket sales</h1>

        {/* Figures: a plain row, no cards */}
        <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className="group relative isolate overflow-hidden rounded-2xl px-3 py-4 sm:px-5 sm:py-5 transition-colors duration-300 hover:bg-zinc-50/80"
            >
              {/* Big, tilted, greyed-out icon: a watermark behind the figure, cropped at the corner */}
              <span
                aria-hidden
                className={`pointer-events-none absolute -right-5 -bottom-7 -z-10 rotate-45 text-zinc-100 transition-[transform,color] duration-500 ease-out motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-[20deg] ${f.tint}`}
              >
                <Icon icon={f.icon} className="size-24 sm:size-36" strokeWidth={1.4} />
              </span>
              <dt className="text-sm text-zinc-500">{f.label}</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-4xl">{f.value}</dd>
              <dd className="mt-1.5 text-sm text-zinc-400">{f.sub}</dd>
            </div>
          ))}
        </dl>

        <OrdersView base={base} rows={list.rows} count={list.count} page={list.page} pages={list.pages} />
    </AdminChrome>
  );
}

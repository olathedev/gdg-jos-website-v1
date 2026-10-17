import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import CheckinDesk from "@/components/admin/CheckinDesk";
import { AdminChrome, TopStrip, Wordmark } from "@/components/admin/Chrome";
import { logoutAction } from "@/app/admin-internal/actions";
import { adminEnabled, adminPath, currentStaff, dashboardRoles, roleLabel } from "@/lib/admin/auth";
import { checkinStats } from "@/lib/admin/checkin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Check-in · DevFest Jos 2026", robots: { index: false, follow: false } };

/** Door check-in. The only screen volunteers can open; admins see it as a tab. */
export default async function CheckinPage() {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const me = await currentStaff();
  if (!me) redirect(base);
  const { checked, total } = await checkinStats();
  const desk = <CheckinDesk checked={checked} total={total} />;

  if (dashboardRoles.includes(me.role)) {
    return (
      <AdminChrome base={base} user={me} active="checkin">
        {desk}
      </AdminChrome>
    );
  }

  return (
    <div className="min-h-svh bg-white font-sans text-ink">
      <TopStrip />
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between gap-4 px-5">
          <Wordmark />
          <div className="flex items-center gap-3">
            <span className="text-right text-xs leading-tight">
              <span className="block font-medium">{me.name ?? me.email}</span>
              <span className="text-zinc-400">{roleLabel[me.role]}</span>
            </span>
            <form action={logoutAction}>
              <button type="submit" className="h-9 rounded-full border border-zinc-200 px-3.5 text-xs font-medium hover:bg-zinc-50">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="px-5 py-6">{desk}</main>
    </div>
  );
}

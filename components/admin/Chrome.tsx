import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminUser } from "@/lib/admin/auth";
import UserMenu from "./UserMenu";

/** A slim slice of the DevFest shapes strip along the very top edge. */
export function TopStrip() {
  return <div aria-hidden className="h-3 w-full bg-[#0a2914] bg-[url(/divider.svg)] bg-[length:auto_82px] bg-[position:center_-34px] bg-repeat-x sm:h-4" />;
}

export function Wordmark() {
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

/** Page frame for signed-in admin pages: top strip, header with tabs, centred content. */
export function AdminChrome({ base, user, active, children }: { base: string; user: AdminUser; active: "sales" | "team"; children: ReactNode }) {
  const tabs = [
    { id: "sales", label: "Sales", href: base },
    { id: "team", label: "Team", href: `${base}/team` },
  ] as const;
  return (
    <div className="min-h-svh bg-white font-sans text-ink">
      <TopStrip />
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-8">
            <Wordmark />
            <nav aria-label="Admin" className="hidden items-center gap-1 sm:flex">
              {tabs.map((t) => (
                <Link
                  key={t.id}
                  href={t.href}
                  aria-current={active === t.id ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-g-blue ${
                    active === t.id ? "bg-zinc-100 text-ink" : "text-zinc-500 hover:text-ink"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
          <UserMenu email={user.email} role={user.role} />
        </div>
        <nav aria-label="Admin" className="flex gap-1 px-5 pb-3 sm:hidden">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              aria-current={active === t.id ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${active === t.id ? "bg-zinc-100 text-ink" : "text-zinc-500"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 pt-10 pb-20 sm:px-8">{children}</main>
    </div>
  );
}

"use client";

import { House, Lightbulb, LogOut, ScanLine, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/quest/actions";
import { Avatar, Logo } from "./ui";

const items = [
  { href: "/quest/home", label: "Home", Icon: House },
  { href: "/quest/people", label: "People", Icon: Users, also: ["/quest/crew"] },
  { href: "/quest/level-up", label: "Level Up", Icon: Lightbulb },
  { href: "/quest/board", label: "Board", Icon: Trophy },
  { href: "/quest/event", label: "Event day", Icon: ScanLine },
];

type Me = { id: string; name: string; initials: string; score: number; pending: number };

const isActive = (path: string, i: (typeof items)[number]) =>
  path === i.href || path.startsWith(`${i.href}/`) || (i.also ?? []).some((a) => path.startsWith(a));

/** Dark pill bar at the bottom on phones; a sidebar on desktop. */
export default function Nav({ me }: { me: Me }) {
  const path = usePathname();
  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 px-3.5 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <ul className="mx-auto flex max-w-md gap-0.5 rounded-full bg-ink p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
          {items.map((i) => {
            const on = isActive(path, i);
            return (
              <li key={i.href} className="flex-1">
                <Link
                  href={i.href}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition-colors ${
                    on ? "bg-white font-bold text-ink" : "font-semibold text-[#BDBDBD] hover:text-white"
                  }`}
                >
                  <i.Icon aria-hidden className="size-5" strokeWidth={2} />
                  {i.label}
                  {i.label === "People" && me.pending > 0 && (
                    <span className="absolute top-1.5 right-[22%] size-2 rounded-full bg-g-red" aria-label={`${me.pending} requests`} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-8 bg-ink p-5 text-white lg:flex">
        <Link href="/quest/home" className="px-2 pt-1">
          <Logo dark />
          <span className="type-heading mt-3 block text-2xl font-bold">
            Agent <span className="text-h-blue">Mode</span>
          </span>
        </Link>
        <ul className="flex flex-col gap-1">
          {items.map((i) => {
            const on = isActive(path, i);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-[15px] transition-colors ${
                    on ? "bg-white font-bold text-ink" : "font-semibold text-[#BDBDBD] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <i.Icon aria-hidden className="size-5" />
                  <span className="flex-1">{i.label}</span>
                  {i.label === "People" && me.pending > 0 && (
                    <span className="rounded-full bg-g-red px-2 py-0.5 text-xs font-bold text-white">{me.pending}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex items-center gap-3 rounded-3xl bg-white/5 p-3">
          <Link href="/quest/setup" className="flex min-w-0 flex-1 items-center gap-3" aria-label="Edit your agent">
            <Avatar id={me.id} initials={me.initials} size={40} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{me.name}</span>
              <span className="text-xs text-[#BDBDBD]">{me.score} points</span>
            </span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex size-10 items-center justify-center rounded-full text-[#BDBDBD] hover:bg-white/10 hover:text-white"
            >
              <LogOut aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

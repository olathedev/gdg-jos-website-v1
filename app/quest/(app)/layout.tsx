import Link from "next/link";
import Nav from "@/components/quest/Nav";
import { QrGlyph, Spark } from "@/components/quest/icons";
import { GameAvatar } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { myScore } from "@/lib/quest/points";
import { db } from "@/lib/tickets/db";
import { displayName, initials } from "@/lib/quest/validate";

export const metadata = { robots: { index: false } };

/** Signed-in game screens: one centred column, a slim top bar and a bottom bar. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAgent();
  const [{ score }, [{ pending }]] = await Promise.all([
    myScore(me.id),
    db()<{ pending: number }[]>`
      select count(*)::int as pending from quest_connections
      where (user_a = ${me.id} or user_b = ${me.id}) and status = 'pending' and requester <> ${me.id}`,
  ]);
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-32">
      <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-3 bg-[#0A0A0A] px-4 py-3">
        <Link href="/quest/profile" className="flex min-w-0 items-center gap-2.5" aria-label="Your profile">
          <GameAvatar avatar={me.avatar} initials={initials(me.full_name)} size={36} />
          <span className="truncate text-sm font-bold">{displayName(me.full_name, me.is_adult)}</span>
        </Link>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#141414] px-3 py-1.5 text-sm font-bold">
            <Spark size={14} />
            <span className="tabular-nums">{score}</span>
            <span className="sr-only">points</span>
          </span>
          <Link
            href="/quest/me"
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-white hover:bg-[#1E1E1E]"
            aria-label="My QR"
          >
            <QrGlyph size={18} />
          </Link>
        </span>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <Nav pending={pending} />
    </div>
  );
}

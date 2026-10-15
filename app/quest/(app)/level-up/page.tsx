import Link from "next/link";
import Quiz from "@/components/quest/Quiz";
import { pillDark } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { levelUp } from "@/lib/quest/game";

export const metadata = { title: "Level Up" };

const bars = ["bg-g-blue", "bg-g-red", "bg-g-yellow", "bg-g-green", "bg-h-red"];

export default async function LevelUp() {
  const me = await requireAgent();
  const lu = await levelUp(me.id);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="type-heading text-[32px] leading-none font-bold lg:text-5xl">
            Level <span className="text-g-green">Up</span>
          </span>
          {lu.streak > 1 && (
            <span className="rounded-full bg-h-yellow px-3 py-1.5 text-[13px] font-bold">{lu.streak}-day streak</span>
          )}
        </div>
        {lu.card ? (
          <Quiz key={lu.card.id} card={lu.card} />
        ) : (
          <div className="relative flex flex-col gap-3 overflow-hidden rounded-[24px_64px_24px_24px] bg-p-green p-6">
            <span aria-hidden className="absolute top-4 right-5 size-10 rotate-[18deg] rounded-xl bg-g-green" />
            <h1 className="type-heading text-3xl font-bold">All caught up</h1>
            <p className="text-[15px] leading-normal text-[#1E3A24]">
              {lu.learntToday
                ? `Today you learnt ${lu.learntToday} ${lu.learntToday === 1 ? "thing" : "things"}. `
                : ""}
              New cards drop every morning until 16 Oct, and session recaps open after talks on 17 Oct.
            </p>
            <Link href="/quest/board" className={`${pillDark} self-start`}>
              See the board
            </Link>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-3.5 self-start rounded-3xl bg-white p-[18px] lg:sticky lg:top-10">
        <h2 className="text-xs font-bold tracking-[0.08em] text-ink/70">YOUR TRACKS</h2>
        {lu.tracks.length === 0 && <p className="text-sm text-[#5F5F5F]">Tracks appear when the first cards drop.</p>}
        {lu.tracks.map((t, i) => (
          <div key={t.name} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="text-[#5F5F5F]">
                {t.done} of {t.total}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-paper"
              role="progressbar"
              aria-label={t.name}
              aria-valuemin={0}
              aria-valuemax={t.total}
              aria-valuenow={t.done}
            >
              <div className={`h-full rounded-full ${bars[i % bars.length]}`} style={{ width: `${(t.done / t.total) * 100}%` }} />
            </div>
          </div>
        ))}
        {lu.learntToday > 0 && (
          <p className="rounded-2xl bg-paper px-3.5 py-2.5 text-[13px] font-semibold">
            Today you learnt {lu.learntToday} {lu.learntToday === 1 ? "thing" : "things"}.
          </p>
        )}
      </aside>
    </div>
  );
}

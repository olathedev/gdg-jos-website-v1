import { Check } from "lucide-react";
import Link from "next/link";
import { LockGlyph, StageBadge } from "@/components/quest/icons";
import { requireAgent } from "@/lib/quest/auth";
import { FOLLOWS, PARTNER_GOAL, PARTNER_UNLOCK_PADIS, SQUAD_GOAL, STAGES, type StageId } from "@/lib/quest/config";
import { leaderboard, myScore } from "@/lib/quest/points";
import { gameState, type StageState } from "@/lib/quest/stages";

export const metadata = { title: "Map" };

// Node centres on the map, in % of width / px from the top.
const X = [28, 72, 28, 72];
const ROW = 168;
const TOP = 70;

function path(i: number) {
  const x1 = X[i];
  const y1 = TOP + i * ROW;
  const x2 = X[i + 1];
  const y2 = TOP + (i + 1) * ROW;
  return `M ${x1} ${y1} C ${x1} ${y1 + ROW / 2}, ${x2} ${y2 - ROW / 2}, ${x2} ${y2}`;
}

export default async function Home({ searchParams }: PageProps<"/quest/home">) {
  const me = await requireAgent();
  const welcome = (await searchParams).welcome === "1";
  const [{ score }, board, g] = await Promise.all([myScore(me.id), leaderboard(), gameState(me.id)]);
  const rank = board.byId.get(me.id)?.rank;
  const liveRound = g.rounds.find((r) => r.status === "live");

  const status = (id: StageId, s: StageState) => {
    if (s === "locked") return id === "partners" ? `${Math.min(g.counts.padis, PARTNER_UNLOCK_PADIS)}/${PARTNER_UNLOCK_PADIS} padis to unlock` : "Locked";
    if (id === "socials") return s === "done" ? "Cleared" : `${g.counts.follows}/${FOLLOWS.length} followed`;
    if (id === "squad") return s === "done" ? `${g.counts.squad} connected` : `${g.counts.squad}/${SQUAD_GOAL} connected`;
    if (id === "quiz") {
      if (s === "live") return `Round ${liveRound?.round} is LIVE`;
      const played = g.rounds.filter((r) => r.played).length;
      return played ? `${played}/3 rounds played` : "Waiting for round 1";
    }
    return s === "done" ? "Cleared" : `${g.counts.partners}/${PARTNER_GOAL} partners`;
  };

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      {welcome && (
        <p role="status" className="quest-pop w-full rounded-full border border-g-green/40 bg-g-green/10 px-4 py-2.5 text-center text-sm font-bold text-[#CCF6C5]">
          You&apos;re in! Start with Stage 1 below.
        </p>
      )}

      {/* Score: centre stage */}
      <section className="flex flex-col items-center pt-5 pb-2 text-center" aria-label="Your score">
        <span className="text-[11px] font-bold tracking-[0.2em] text-white/45">YOUR SCORE</span>
        <span className="type-heading quest-pop flex items-center gap-3 text-[64px] leading-none font-bold tabular-nums">
          <span aria-hidden className="text-g-blue">{"{"}</span>
          {score}
          <span aria-hidden className="text-g-yellow">{"}"}</span>
        </span>
        <Link
          href="/quest/board"
          className="mt-2 rounded-full border border-white/10 bg-[#141414] px-3.5 py-1.5 text-xs font-bold text-white/80 hover:text-white"
        >
          {rank ? `Rank #${rank} on the board` : "Not ranked yet"}
        </Link>
      </section>

      {/* The map */}
      <div className="relative w-full" style={{ height: TOP * 2 + ROW * 3 }}>
        <svg
          aria-hidden
          className="absolute inset-0 size-full"
          viewBox={`0 0 100 ${TOP * 2 + ROW * 3}`}
          preserveAspectRatio="none"
        >
          {[0, 1, 2].map((i) => {
            const done = g.states[STAGES[i].id] === "done";
            return (
              <path
                key={i}
                d={path(i)}
                fill="none"
                stroke={done ? STAGES[i].color : "rgb(255 255 255 / 0.2)"}
                strokeWidth={done ? 4 : 3}
                strokeDasharray={done ? undefined : "2 9"}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {STAGES.map((st, i) => {
          const s = g.states[st.id];
          const current = g.current === st.id && s !== "done";
          const left = X[i] < 50;
          return (
            <Link
              key={st.id}
              href={`/quest/stage/${st.id}`}
              className={`group absolute flex -translate-y-1/2 items-center gap-3 ${left ? "flex-row" : "flex-row-reverse text-right"}`}
              style={{
                top: TOP + i * ROW,
                ...(left ? { left: `calc(${X[i]}% - ${st.id === "partners" ? 53 : 42}px)` } : { right: `calc(${100 - X[i]}% - ${st.id === "partners" ? 53 : 42}px)` }),
              }}
              aria-label={`Stage ${st.num}: ${st.title}. ${status(st.id, s)}`}
            >
              <span className={`relative flex shrink-0 items-center justify-center ${current ? "quest-float" : ""}`}>
                <span className="transition-transform group-hover:scale-105 group-active:scale-95">
                  <StageBadge id={st.id} color={st.color} size={84} locked={s === "locked"} />
                </span>
                {s === "done" && (
                  <span className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full border-[3px] border-[#0A0A0A] bg-white">
                    <Check aria-hidden className="size-3.5 text-[#0A0A0A]" strokeWidth={4} />
                  </span>
                )}
                {s === "locked" && (
                  <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-[3px] border-[#0A0A0A] bg-[#2A2A2A] text-white/70">
                    <LockGlyph size={12} />
                  </span>
                )}
                {(current || s === "live") && (
                  <span
                    className={`absolute -bottom-3 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-[0.12em] ${
                      s === "live" ? "bg-g-red text-white" : "bg-white text-[#0A0A0A]"
                    }`}
                  >
                    {s === "live" ? "LIVE" : "PLAY"}
                  </span>
                )}
              </span>
              <span className="flex w-[120px] flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: s === "locked" ? "rgb(255 255 255 / 0.35)" : st.color }}>
                  STAGE {st.num}
                </span>
                <span className={`type-heading text-[17px] leading-tight font-bold ${s === "locked" ? "text-white/40" : ""}`}>
                  {st.title}
                </span>
                <span className={`text-xs font-semibold ${s === "locked" ? "text-white/30" : "text-white/65"}`}>{status(st.id, s)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

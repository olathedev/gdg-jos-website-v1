import Link from "next/link";
import { notFound } from "next/navigation";
import { LockGlyph, RankBadge, StageBadge } from "@/components/quest/icons";
import RoundPlayer from "@/components/quest/RoundPlayer";
import { LockedStage } from "@/components/quest/Stage";
import { gameBtn, gameBtnGhost } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS, ROUND_QUESTIONS } from "@/lib/quest/config";
import { roundView } from "@/lib/quest/stages";

export const metadata = { title: "Brain Blitz" };

export default async function RoundPage({ params }: PageProps<"/quest/quiz/[round]">) {
  const round = Number((await params).round);
  if (![1, 2, 3].includes(round)) notFound();
  const me = await requireAgent();
  const view = await roundView(me.id, round);

  if (view.kind === "locked") return <LockedStage id="quiz" message="Scan 3 people in Padi Up to unlock Brain Blitz." />;

  if (view.kind === "ready" || view.kind === "playing") return <RoundPlayer round={round} initial={view} />;

  if (view.kind === "result") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
        <span aria-hidden className="quest-pop">
          {view.rank && view.rank <= 3 ? <RankBadge rank={view.rank} size={84} /> : <StageBadge id="quiz" color="#F9AB00" size={84} />}
        </span>
        <span className="text-[11px] font-bold tracking-[0.2em] text-h-yellow">ROUND {round} COMPLETE</span>
        <span className="type-heading text-[56px] leading-none font-bold tabular-nums">
          {view.score}
          <span className="text-2xl text-white/40">/{view.total || ROUND_QUESTIONS}</span>
        </span>
        <span className="text-sm font-semibold text-white/70">
          +{view.score * POINTS.roundAnswer} points · {view.seconds}s
          {view.rank ? ` · #${view.rank} this round` : ""}
        </span>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Link href="/quest/stage/quiz" className={gameBtn}>
            See round leaderboard
          </Link>
          <Link href="/quest/home" className={gameBtnGhost}>
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <span aria-hidden className="relative">
        <StageBadge id="quiz" color="#F9AB00" size={80} locked />
        <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-[3px] border-[#0A0A0A] bg-[#2A2A2A] text-white/70">
          <LockGlyph size={14} />
        </span>
      </span>
      <h1 className="type-heading text-2xl font-bold">{view.kind === "soon" ? `Round ${round} opens soon` : `Round ${round} is closed`}</h1>
      <p className="max-w-xs text-sm text-white/65">
        {view.kind === "soon" ? "Organisers open each round live. Keep an eye on the screens." : "This round has ended."}
      </p>
      <Link href="/quest/stage/quiz" className={gameBtn}>
        Back to Brain Blitz
      </Link>
    </div>
  );
}

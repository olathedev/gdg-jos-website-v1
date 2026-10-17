import Link from "next/link";
import AutoRefresh from "@/components/quest/AutoRefresh";
import { LockGlyph, RankBadge } from "@/components/quest/icons";
import { LockedStage, StageHeader } from "@/components/quest/Stage";
import { GameAvatar, panel } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS, ROUND_QUESTIONS, ROUND_SECONDS } from "@/lib/quest/config";
import { gameState, roundBoard } from "@/lib/quest/stages";

export const metadata = { title: "Brain Blitz" };

export default async function QuizStage() {
  const me = await requireAgent();
  const g = await gameState(me.id);
  if (g.states.quiz === "locked") {
    return <LockedStage id="quiz" message="Scan 3 people in Padi Up to unlock Brain Blitz." />;
  }
  // Show the board for the live round, or else the latest one that has opened.
  const shown = g.rounds.find((r) => r.status === "live") ?? [...g.rounds].reverse().find((r) => r.status === "closed");
  const top = shown ? await roundBoard(shown.round) : [];
  const played = g.rounds.filter((r) => r.played).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Picks up rounds opened from the admin page without a manual refresh. */}
      <AutoRefresh seconds={20} />
      <StageHeader id="quiz" progress={played} goal={3} done={g.states.quiz === "done"}>
        <span className="rounded-full bg-h-yellow px-3 py-1 text-xs font-black text-ink">
          {ROUND_QUESTIONS} questions · {ROUND_SECONDS}s · +{POINTS.roundAnswer} per right answer
        </span>
      </StageHeader>

      <ul className="flex flex-col gap-3">
        {g.rounds.map((r) => {
          const live = r.status === "live";
          const body = (
            <>
              <span
                aria-hidden
                className={`type-heading flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${
                  live ? "bg-h-yellow text-[#0A0A0A]" : r.played ? "bg-white text-[#0A0A0A]" : "border border-dashed border-white/20 text-white/40"
                }`}
              >
                {r.round}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="type-heading text-lg font-bold">Round {r.round}</span>
                <span className="text-sm text-white/60">
                  {r.played
                    ? r.finished
                      ? `You scored ${r.score}/${ROUND_QUESTIONS}`
                      : "In progress, tap to continue"
                    : live
                      ? "Open now. One shot only."
                      : r.status === "soon"
                        ? "Opens soon. Watch the screens."
                        : "Closed"}
                </span>
              </span>
              {live && !r.finished && (
                <span className="animate-pulse rounded-full bg-g-red px-2.5 py-1 text-[11px] font-black tracking-wider">LIVE</span>
              )}
              {r.status === "soon" && <LockGlyph size={18} className="text-white/40" />}
            </>
          );
          const cls = `${panel} flex items-center gap-4 p-4 ${live && !r.finished ? "border-h-yellow/50" : ""}`;
          return (
            <li key={r.round}>
              {live || (r.played && !r.finished) || r.finished ? (
                <Link href={`/quest/quiz/${r.round}`} className={`${cls} transition-transform active:scale-[0.98]`}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {shown && (
        <section className="flex flex-col gap-3" aria-labelledby="rb-h">
          <h2 id="rb-h" className="text-center text-[11px] font-bold tracking-[0.2em] text-white/50">
            ROUND {shown.round} · TOP 10
          </h2>
          {top.length === 0 ? (
            <p className={`${panel} px-5 py-6 text-center text-sm text-white/60`}>No scores yet. Be first.</p>
          ) : (
            <ol className={`${panel} flex flex-col divide-y divide-white/5 px-3`}>
              {top.map((r) => (
                <li key={r.id} className={`flex items-center gap-3 py-2.5 ${r.id === me.id ? "text-h-yellow" : ""}`}>
                  <RankBadge rank={r.rank} size={26} />
                  <GameAvatar avatar={r.avatar} size={32} />
                  <span className="flex-1 truncate text-sm font-bold">{r.name}</span>
                  <span className="text-xs text-white/50 tabular-nums">{r.seconds}s</span>
                  <span className="w-10 text-right text-sm font-black tabular-nums">{r.score}/{ROUND_QUESTIONS}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

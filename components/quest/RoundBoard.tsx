import { ROUND_QUESTIONS } from "@/lib/quest/config";
import type { roundBoard } from "@/lib/quest/stages";
import { RankBadge } from "./icons";
import { GameAvatar, panel } from "./ui";

/** A Brain Blitz round's top 10, with the viewer highlighted. */
export default function RoundBoard({
  round,
  rows,
  meId,
  closed,
}: {
  round: number;
  rows: Awaited<ReturnType<typeof roundBoard>>;
  meId: string;
  closed?: boolean;
}) {
  const id = `rb-${round}`;
  return (
    <section className="flex w-full flex-col gap-3" aria-labelledby={id}>
      <h2 id={id} className="text-center text-[11px] font-bold tracking-[0.2em] text-fg/50">
        ROUND {round} · TOP 10
      </h2>
      {rows.length === 0 ? (
        <p className={`${panel} px-5 py-6 text-center text-sm text-fg/60`}>{closed ? "Nobody played this round." : "No scores yet. Be first."}</p>
      ) : (
        <ol className={`${panel} flex flex-col divide-y divide-fg/5 px-3 text-left`}>
          {rows.map((r) => (
            <li key={r.id} className={`flex items-center gap-3 py-2.5 ${r.id === meId ? "text-hl" : ""}`}>
              <RankBadge rank={r.rank} size={26} />
              <GameAvatar avatar={r.avatar} size={32} />
              <span className="flex-1 truncate text-sm font-bold">{r.name}</span>
              <span className="text-xs text-fg/50 tabular-nums">{r.seconds}s</span>
              <span className="w-10 text-right text-sm font-black tabular-nums">
                {r.score}/{ROUND_QUESTIONS}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

import Link from "next/link";
import { QrGlyph, ScanGlyph, StageGlyph } from "@/components/quest/icons";
import { LockedStage, StageHeader, Steps } from "@/components/quest/Stage";
import { GameAvatar, gameBtn, gameBtnGhost, panel } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS, SQUAD_GOAL } from "@/lib/quest/config";
import { gameState, squadList } from "@/lib/quest/stages";

export const metadata = { title: "Squad Up" };

const steps = [
  "Find someone and say hi",
  "Learn their name, stack and fun fact",
  "Tap Scan and point at their QR",
  "Answer 3 questions about them to lock in",
];

export default async function SquadPage() {
  const me = await requireAgent();
  const g = await gameState(me.id);
  if (g.states.squad === "locked") {
    return <LockedStage id="squad" message="Clear Stage 1, Follow the Signal, to unlock Squad Up." />;
  }
  const squad = await squadList(me.id);
  const done = squad.length >= SQUAD_GOAL;

  return (
    <div className="flex flex-col gap-6">
      <StageHeader id="squad" progress={squad.length} goal={SQUAD_GOAL} done={done}>
        <span className="rounded-full bg-h-yellow px-3 py-1 text-xs font-black text-ink">+{POINTS.meet} per person · no limit</span>
      </StageHeader>

      <Steps id="squad" steps={steps} />
      <p className="-mt-3 text-center text-xs text-white/50">Get any answer wrong and you&apos;ll have to wait a bit, so really talk to them.</p>

      <div className="flex flex-col gap-3">
        <Link href="/quest/scan" className={gameBtn}>
          <ScanGlyph size={20} /> Scan a player
        </Link>
        <Link href="/quest/me" className={gameBtnGhost}>
          <QrGlyph size={18} /> Show my QR
        </Link>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="squad-h">
        <h2 id="squad-h" className="text-center text-[11px] font-bold tracking-[0.2em] text-white/50">
          YOUR SQUAD · {squad.length}
        </h2>
        {squad.length === 0 ? (
          <div className={`${panel} flex flex-col items-center gap-2 px-5 py-8 text-center`}>
            <span aria-hidden className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-white/40">
              <StageGlyph id="squad" size={24} ink="currentColor" fill="transparent" />
            </span>
            <span className="text-sm text-white/60">No one locked in yet. Your first squad member is out there.</span>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-3">
            {squad.map((p) => (
              <li key={p.id} className={`${panel} quest-pop flex flex-col items-center gap-2 px-2 py-4 text-center`}>
                <GameAvatar avatar={p.avatar} size={52} />
                <span className="w-full truncate text-xs font-bold">{p.name}</span>
              </li>
            ))}
            {Array.from({ length: Math.max(0, SQUAD_GOAL - squad.length) }, (_, i) => (
              <li
                key={`empty-${i}`}
                className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-white/10 px-2 py-4 text-center"
              >
                <span className="flex size-[52px] items-center justify-center rounded-full bg-white/5 text-xl text-white/30">?</span>
                <span className="text-xs font-bold text-white/30">Open slot</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

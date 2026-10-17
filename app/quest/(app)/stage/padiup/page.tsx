import Link from "next/link";
import { QrGlyph, ScanGlyph, StageGlyph } from "@/components/quest/icons";
import { LockedStage, StageHeader, Steps } from "@/components/quest/Stage";
import { GameAvatar, gameBtn, gameBtnGhost, panel } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS, SQUAD_GOAL } from "@/lib/quest/config";
import { gameState, squadList } from "@/lib/quest/stages";

export const metadata = { title: "Padi Up" };

const steps = [
  "Find someone and say hi",
  "Tap Scan and point at their QR (or let them scan yours)",
  "You're connected instantly and you both score",
];

export default async function PadiUpPage() {
  const me = await requireAgent();
  const g = await gameState(me.id);
  if (g.states.padiup === "locked") {
    return <LockedStage id="padiup" message="Padi Up is opening up. Try again in a moment." />;
  }
  const squad = await squadList(me.id);
  const done = squad.length >= SQUAD_GOAL;

  return (
    <div className="flex flex-col gap-6">
      <StageHeader id="padiup" progress={squad.length} goal={SQUAD_GOAL} done={done}>
        <span className="rounded-full bg-h-yellow px-3 py-1 text-xs font-black text-ink">+{POINTS.meet} each · no limit</span>
      </StageHeader>

      <Steps id="padiup" steps={steps} />
      <p className="-mt-3 text-center text-xs text-white/50">Each pair scores once, whoever scans whom.</p>

      <div className="flex flex-col gap-3">
        <Link href="/quest/scan" className={gameBtn}>
          <ScanGlyph size={20} /> Scan a player
        </Link>
        <Link href="/quest/me" className={gameBtnGhost}>
          <QrGlyph size={18} /> Show my QR
        </Link>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="padis-h">
        <h2 id="padis-h" className="text-center text-[11px] font-bold tracking-[0.2em] text-white/50">
          YOUR PADIS · {squad.length}
        </h2>
        {squad.length === 0 ? (
          <div className={`${panel} flex flex-col items-center gap-2 px-5 py-8 text-center`}>
            <span aria-hidden className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-white/40">
              <StageGlyph id="padiup" size={24} ink="currentColor" fill="transparent" />
            </span>
            <span className="text-sm text-white/60">No one yet. Your first padi is out there.</span>
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

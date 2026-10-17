import { Check } from "lucide-react";
import Link from "next/link";
import { ScanGlyph } from "@/components/quest/icons";
import { Banner, LockedStage, StageHeader, Steps } from "@/components/quest/Stage";
import { gameBtn } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { PARTNER_GOAL, PARTNER_UNLOCK_PADIS, POINTS } from "@/lib/quest/config";
import { gameState, partners } from "@/lib/quest/stages";

export const metadata = { title: "Partner Link-up" };

const steps = ["Visit a partner stand", "Ask them what they do", "Tap Scan and point at the code they show you"];

export default async function PartnersPage({ searchParams }: PageProps<"/quest/stage/partners">) {
  const me = await requireAgent();
  const sp = await searchParams;
  const r = typeof sp.r === "string" ? sp.r : undefined;
  const n = typeof sp.n === "string" ? sp.n.slice(0, 60) : undefined;
  const g = await gameState(me.id);
  if (g.states.partners === "locked") {
    return (
      <LockedStage
        id="partners"
        message={`Get ${PARTNER_UNLOCK_PADIS} padis to unlock Partner Link-up. You have ${g.counts.padis}. Scan people or accept padi requests.`}
      />
    );
  }
  const list = await partners(me.id);
  const visited = list.filter((p) => p.visited);
  const slots = Array.from({ length: Math.max(PARTNER_GOAL, visited.length) }, (_, i) => visited[i] ?? null);

  return (
    <div className="flex flex-col gap-6">
      {r === "booth" && <Banner tone="good">Linked up{n ? ` with ${n}` : ""}! +{POINTS.booth}</Banner>}
      {r === "again" && <Banner tone="info">You already scanned this partner.</Banner>}
      {r === "closed" && <Banner tone="bad">This stand is closed right now.</Banner>}
      {r === "unknown" && <Banner tone="bad">That code isn&apos;t a partner code.</Banner>}

      <StageHeader id="partners" progress={visited.length} goal={PARTNER_GOAL} done={visited.length >= PARTNER_GOAL}>
        <span className="rounded-full bg-h-yellow px-3 py-1 text-xs font-black text-ink">+{POINTS.booth} per partner</span>
      </StageHeader>

      <ul className="grid grid-cols-3 gap-3">
        {slots.map((p, i) =>
          p ? (
            <li key={p.id} className="quest-pop flex flex-col items-center gap-2 rounded-3xl border-2 border-g-green bg-g-green/15 px-2 py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-g-green">
                <Check aria-hidden className="size-6" strokeWidth={3.5} />
              </span>
              <span className="w-full truncate text-xs font-bold">{p.name}</span>
            </li>
          ) : (
            <li
              key={`slot-${i}`}
              className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-white/10 px-2 py-4 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white/5 text-xl text-white/30">?</span>
              <span className="text-xs font-bold text-white/30">Partner {i + 1}</span>
            </li>
          ),
        )}
      </ul>

      <Steps id="partners" steps={steps} />

      <Link href="/quest/scan" className={gameBtn}>
        <ScanGlyph size={20} /> Scan a partner code
      </Link>

      {list.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="pl-h">
          <h2 id="pl-h" className="text-center text-[11px] font-bold tracking-[0.2em] text-white/50">
            PARTNERS AT DEVFEST JOS
          </h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {list.map((p) => (
              <li
                key={p.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  p.visited ? "bg-g-green/20 text-[#CCF6C5]" : "bg-white/[0.06] text-white/70"
                }`}
              >
                {p.visited && <Check aria-hidden className="size-3" strokeWidth={4} />}
                {p.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import { Check } from "lucide-react";
import Link from "next/link";
import { ScanGlyph } from "@/components/quest/icons";
import { PartnerLogo } from "@/components/quest/PartnerProfile";
import { Banner, LockedStage, StageHeader, Steps } from "@/components/quest/Stage";
import { gameBtn, panel } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { PARTNER_GOAL, PARTNER_UNLOCK_PADIS, POINTS } from "@/lib/quest/config";
import { type PartnerCard, partnerCards } from "@/lib/quest/partners";
import { gameState, partners } from "@/lib/quest/stages";

export const metadata = { title: "Partner Link-up" };

const steps = ["Visit a partner stand", "Ask them what they do", "Tap Scan and point at the code they show you"];

export default async function PartnersPage({ searchParams }: PageProps<"/quest/stage/partners">) {
  const me = await requireAgent();
  const sp = await searchParams;
  const r = typeof sp.r === "string" ? sp.r : undefined;
  const n = typeof sp.n === "string" ? sp.n.slice(0, 60) : undefined;
  const [g, cards] = await Promise.all([gameState(me.id), partnerCards(me.id)]);
  if (g.states.partners === "locked") {
    // Booth scans wait for the stage; profiles and follows score any time.
    return (
      <div className="flex flex-col gap-6">
        {r === "inactive" && <Banner tone="bad">This booth code isn&apos;t active.</Banner>}
        <LockedStage
          id="partners"
          message={
            g.partnersOpen
              ? `Get ${PARTNER_UNLOCK_PADIS} padis to unlock Partner Link-up. You have ${g.counts.padis}. Scan people or accept padi requests.`
              : "Partner Link-up isn't open yet. Organisers will announce it, so keep collecting padis."
          }
        />
        <PartnerGrid cards={cards} note="You can already check out partners and follow them for points." />
      </div>
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
      {r === "inactive" && <Banner tone="bad">This booth code isn&apos;t active.</Banner>}

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
              className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-fg/10 px-2 py-4 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-fg/5 text-xl text-fg/30">?</span>
              <span className="text-xs font-bold text-fg/30">Partner {i + 1}</span>
            </li>
          ),
        )}
      </ul>

      <Steps id="partners" steps={steps} />

      <Link href="/quest/scan" className={gameBtn}>
        <ScanGlyph size={20} /> Scan a partner code
      </Link>

      <PartnerGrid cards={cards} />
    </div>
  );
}

/** Every active partner: logo, name, first line, and this player's progress. */
function PartnerGrid({ cards, note }: { cards: PartnerCard[]; note?: string }) {
  if (!cards.length) return null;
  return (
    <section className="flex flex-col gap-3" aria-labelledby="pl-h">
      <h2 id="pl-h" className="text-center text-[11px] font-bold tracking-[0.2em] text-fg/50">
        PARTNERS AT DEVFEST JOS
      </h2>
      {note && <p className="text-center text-sm text-fg/60">{note}</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {cards.map((p) => (
          <li key={p.id}>
            <Link href={`/quest/stage/partners/${p.slug}`} className={`${panel} flex min-h-20 items-center gap-3 p-3 transition-transform active:scale-[0.98]`}>
              <PartnerLogo name={p.name} url={p.logo_url} size={52} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[15px] font-bold">{p.name}</span>
                {p.description && <span className="truncate text-xs text-fg/60">{p.description.split("\n")[0]}</span>}
                <span className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                  <Tick on={p.visited} label="Visited" />
                  <Tick on={p.booth} label="Booth" />
                  {p.socials.length > 0 && <Tick on={p.follows.length >= p.socials.length} label={`Followed ${p.follows.length}/${p.socials.length}`} />}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tick({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${on ? "bg-g-green/20 text-good" : "bg-fg/[0.06] text-fg/55"}`}>
      {on && <Check aria-hidden className="size-3" strokeWidth={4} />}
      {label}
    </span>
  );
}

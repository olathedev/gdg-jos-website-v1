import { Check } from "lucide-react";
import Link from "next/link";
import { POINTS } from "@/lib/quest/config";
import type { PartnerCard } from "@/lib/quest/partners";
import { PartnerLogo } from "./PartnerProfile";

/** "Our partners" on Home: one scrollable row of logo cards with the player's progress. Hidden when there are none. */
export default function PartnersRow({ partners }: { partners: PartnerCard[] }) {
  if (!partners.length) return null;
  return (
    <section className="flex flex-col gap-2" aria-labelledby="partners-row-h">
      <div className="flex items-center justify-between px-1">
        <h2 id="partners-row-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/45">
          OUR PARTNERS
        </h2>
        <Link href="/quest/partners" className="flex min-h-11 items-center text-xs font-bold text-hl">
          See all
        </Link>
      </div>
      <ul className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {partners.map((p) => (
          <li key={p.id} className="shrink-0">
            <Link
              href={`/quest/stage/partners/${p.slug}`}
              className="flex w-[104px] flex-col items-center gap-1.5 rounded-[20px] border border-fg/[0.08] bg-surface px-2 py-3 text-center transition-transform active:scale-[0.97]"
            >
              <PartnerLogo name={p.name} url={p.logo_url} size={64} />
              <span className="w-full truncate text-xs font-bold">{p.name}</span>
              <span className="flex gap-1" aria-label={`${p.visited ? "Visited online" : "Not visited online"}, ${p.booth ? "booth scanned" : "booth not scanned"}`}>
                <Tick on={p.visited} label="Online" />
                <Tick on={p.booth} label="Booth" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="px-1 text-xs text-fg/55">Visit a partner&apos;s booth and scan their QR for {POINTS.booth} points.</p>
    </section>
  );
}

function Tick({ on, label }: { on: boolean; label: string }) {
  return (
    <span aria-hidden className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${on ? "bg-g-green/20 text-good" : "bg-fg/[0.06] text-fg/45"}`}>
      {on && <Check className="size-2.5" strokeWidth={4} />}
      {label}
    </span>
  );
}

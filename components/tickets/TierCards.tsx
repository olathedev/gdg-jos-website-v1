import { Check } from "lucide-react";
import Link from "next/link";
import { priceLabel, tierColor, tierList } from "@/lib/tickets/tiers";
import TierArt from "./TierArt";

/** Ticket-stub cards for the three tiers (landing section + /tickets page). */
export default function TierCards() {
  return (
    <ul className="grid items-stretch gap-4 md:grid-cols-3 md:gap-5">
      {tierList.map((t) => {
        const featured = t.id === "vip";
        return (
          <li
            key={t.id}
            className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 ${
              featured ? "ring-2 ring-ink" : "ring-1 ring-ink/10"
            }`}
          >
            {/* Stub top */}
            <div className="relative isolate px-6 pt-6 pb-7 sm:px-7" style={{ backgroundColor: tierColor[t.id] }}>
              <TierArt tier={t.id} compact className="-z-10" />
              <div className="flex items-center justify-between gap-3">
                <h3 className="type-heading text-2xl">{t.name}</h3>
                {t.badge && <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white">{t.badge}</span>}
              </div>
              <p className="mt-1.5 max-w-[16rem] text-sm text-ink/70">{t.tagline}</p>
              <p className="type-heading mt-6 text-5xl">{priceLabel(t)}</p>
              <p className="mt-1 text-sm text-ink/60">
                {t.priceKobo === 0 ? "No payment needed" : t.seatsPerUnit > 1 ? `for ${t.seatsPerUnit} people` : "per person"}
              </p>
            </div>

            {/* Perforation */}
            <div aria-hidden className="relative">
              <span className="absolute -top-3 -left-3 size-6 rounded-full bg-paper" />
              <span className="absolute -top-3 -right-3 size-6 rounded-full bg-paper" />
              <div className="mx-6 border-t-2 border-dashed border-ink/15" />
            </div>

            {/* Perks + CTA */}
            <div className="flex flex-1 flex-col px-6 pt-6 pb-6 sm:px-7 sm:pb-7">
              <ul className="mb-8 space-y-3 text-[15px]">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3">
                    <Check aria-hidden className="size-4 shrink-0 text-g-green" strokeWidth={2.75} />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href={`/tickets/checkout?tier=${t.id}`}
                className={`mt-auto flex h-12 items-center justify-center rounded-full text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue ${
                  featured ? "bg-ink text-white hover:bg-ink/85" : "bg-paper text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-white"
                }`}
              >
                {t.priceKobo === 0 ? "Register free" : `Get ${t.name}`}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { event } from "@/data/devfest26";
import { priceLabel, tierList, type Tier } from "@/lib/tickets/tiers";
import { Eyebrow, Reveal } from "./ui";

const style: Record<Tier["tone"], { card: string; check: string; cta: string; muted: string; badge: string }> = {
  paper: {
    card: "bg-white text-ink ring-1 ring-ink/10",
    check: "bg-p-green text-ink",
    cta: "bg-ink text-white hover:bg-g-blue",
    muted: "text-ink/65",
    badge: "",
  },
  blue: {
    card: "bg-ink text-white lg:-my-4 lg:py-12",
    check: "bg-g-blue text-white",
    cta: "bg-white text-ink hover:bg-h-yellow",
    muted: "text-white/70",
    badge: "bg-g-blue text-white",
  },
  yellow: {
    card: "bg-h-yellow text-ink",
    check: "bg-ink text-h-yellow",
    cta: "bg-ink text-white hover:bg-g-blue",
    muted: "text-ink/70",
    badge: "bg-ink text-white",
  },
};

export default function Tickets() {
  return (
    <section id="tickets" className="scroll-mt-24 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow className="justify-center text-ink/60">Tickets</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="type-heading mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
              Grab your <span className="text-g-blue">spot.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-ink/70">
              {event.dateLabel} at {event.venue}, {event.city}. Pick a ticket, and it lands in your inbox with a QR
              code for the door.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {tierList.map((t, i) => {
            const s = style[t.tone];
            return (
              <Reveal as="li" key={t.id} delay={i * 0.08} className={`relative flex flex-col rounded-[2rem] p-7 sm:p-9 ${s.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="type-heading text-3xl">{t.name}</h3>
                  {t.badge && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${s.badge}`}>
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className={`mt-2 ${s.muted}`}>{t.tagline}</p>

                <p className="mt-8 flex items-baseline gap-2">
                  <span className="type-heading text-5xl">{priceLabel(t)}</span>
                  {t.seatsPerUnit > 1 && <span className={`text-sm font-semibold ${s.muted}`}>for {t.seatsPerUnit} people</span>}
                </p>

                <ul className="mt-8 space-y-3">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-3">
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full ${s.check}`}>
                        <Check aria-hidden className="size-3.5" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  <Link
                    href={`/tickets/checkout?tier=${t.id}`}
                    className={`flex h-12 items-center justify-center rounded-full text-[15px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue ${s.cta}`}
                  >
                    {t.priceKobo === 0 ? "Register free" : `Get ${t.name}`}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-ink/60">
          <ShieldCheck aria-hidden className="size-4 text-g-green" />
          Payments are processed securely by Paystack.
        </p>
      </div>
    </section>
  );
}

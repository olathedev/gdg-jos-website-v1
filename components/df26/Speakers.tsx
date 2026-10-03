"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { COMMUNITY_URL, event, speakers2026 } from "@/data/devfest26";
import { Braces, Eyebrow, PillLink, QuarterCircle, Reveal, Ring, Squiggle } from "./ui";

// Each speaker gets a Google colour (rotating), a big soft shape behind the
// cut-out, and a pastel name panel. Role text uses Google's darker tones (AA on pastel).
const tones = [
  { bg: "bg-g-blue", panel: "bg-p-blue", role: "text-[#1967d2]", Shape: Ring, shape: "-top-16 -right-20 w-[26rem]" },
  { bg: "bg-g-red", panel: "bg-p-red", role: "text-[#c5221f]", Shape: Squiggle, shape: "top-10 -left-24 w-[34rem] rotate-[-20deg]" },
  { bg: "bg-g-yellow", panel: "bg-p-yellow", role: "text-[#b06000]", Shape: QuarterCircle, shape: "-top-6 -right-6 w-80 rotate-90" },
  { bg: "bg-g-green", panel: "bg-p-green", role: "text-[#188038]", Shape: Braces, shape: "top-6 -right-16 w-96 rotate-12" },
] as const;

const featured = speakers2026;

export default function Speakers() {
  const [active, setActive] = useState(0);

  return (
    <section id="speakers" className="scroll-mt-24 overflow-hidden bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow className="text-ink/60">Speakers</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-heading mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
                <span className="text-g-green">Meet the speakers.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg text-ink/70">
                The first voices on the DevFest Jos 2026 stage. More names drop soon. Want to be one of them?
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="flex flex-wrap gap-3">
            <PillLink href={event.speakerUrl ?? COMMUNITY_URL} variant="dark" size="lg">
              Apply to speak
            </PillLink>
          </Reveal>
        </div>
      </div>

      {/* Desktop: expanding strip. Mobile: swipeable cards (always shown expanded). */}
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-7xl px-4 sm:px-8">
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide lg:mx-0 lg:h-[34rem] lg:overflow-visible lg:px-0 lg:pb-0">
          {featured.map((s, i) => {
            const isActive = i === active;
            const t = tones[i % tones.length];
            const collapsed = (cls: string) => (isActive ? "" : cls); // desktop-only collapsed state
            return (
              <li
                key={s.name}
                onMouseEnter={() => setActive(i)}
                className={`relative isolate h-[27rem] w-72 shrink-0 snap-start overflow-hidden rounded-[1.75rem] transition-[flex-grow,background-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:h-auto lg:w-auto lg:min-w-0 lg:shrink ${
                  isActive ? "lg:grow-[6]" : "lg:grow"
                } ${t.bg} ${collapsed("lg:bg-[#2a2a2a]")}`}
              >
                <button
                  type="button"
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-label={`${s.name}, ${s.role}`}
                  aria-pressed={isActive}
                  className="absolute inset-0 z-30 hidden rounded-[1.75rem] focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-ink lg:block"
                />

                {/* Big soft brand shape */}
                <t.Shape className={`absolute -z-10 text-white/25 transition-opacity duration-500 ${t.shape} ${collapsed("lg:opacity-0")}`} />

                {/* Cut-out portrait */}
                <div className={`absolute inset-x-0 top-0 bottom-28 transition-[bottom] duration-500 ${collapsed("lg:bottom-0")}`}>
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(min-width: 1024px) 34rem, 18rem"
                    className={`object-cover object-top transition-[filter,transform] duration-700 ${collapsed("lg:scale-105 lg:grayscale")}`}
                  />
                  <div className={`absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${collapsed("lg:opacity-100")}`} />
                </div>

                {/* Collapsed: vertical first name */}
                <p
                  aria-hidden
                  className={`type-heading absolute bottom-6 left-1/2 hidden -translate-x-1/2 rotate-180 text-2xl whitespace-nowrap text-white [writing-mode:vertical-rl] ${collapsed("lg:block")}`}
                >
                  {s.name.split(" ")[0]}
                </p>

                {/* Panel badge (e.g. Panelist / Moderator) */}
                {s.badge && (
                  <span
                    className={`absolute top-4 left-4 z-20 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm transition-opacity duration-300 ${collapsed("lg:opacity-0")}`}
                  >
                    {s.badge}
                  </span>
                )}

                {/* Name panel */}
                <div
                  className={`absolute inset-x-0 bottom-0 flex h-28 flex-col justify-center px-5 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:px-7 ${t.panel} ${collapsed("lg:translate-y-full")}`}
                >
                  <p className="type-heading truncate text-2xl text-ink">{s.name}</p>
                  {s.role && <p className={`mt-1 line-clamp-2 text-sm font-medium ${t.role}`}>{s.role}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

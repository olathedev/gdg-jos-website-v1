"use client";

import Image from "next/image";
import { upscaled } from "@/lib/cloudinary-loader";
import Link from "next/link";
import { useState } from "react";
import { speakers } from "@/data/data";
import { COMMUNITY_URL, event } from "@/data/devfest26";
import { Eyebrow, PillLink, Reveal } from "./ui";

// Map the legacy hex values in data.ts onto the brand palette.
const toneFor = (hex: string) =>
  ({ "#4286F2": "bg-g-blue", "#FF0000": "bg-g-red", "#FFA800": "bg-g-yellow", "#34A853": "bg-g-green" })[hex] ?? "bg-g-blue";

const featured = speakers.slice(0, 9);

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
                <span className="text-g-green">Real builders.</span> On our stage.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg text-ink/70">
                Some of the people who took the mic at DevFest Jos 2025. The 2026 lineup drops soon. Want to be on it?
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="flex flex-wrap gap-3">
            <PillLink href={event.speakerUrl ?? COMMUNITY_URL} variant="dark" size="lg">
              Apply to speak
            </PillLink>
            <Link
              href="/devfest/speakers"
              className="inline-flex h-12 items-center rounded-full px-4 text-[15px] font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-g-blue"
            >
              All 2025 speakers
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Desktop: expanding strip. Mobile: swipeable cards. */}
      <Reveal delay={0.1} className="mx-auto mt-14 max-w-7xl px-4 sm:px-8">
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide lg:mx-0 lg:h-[32rem] lg:overflow-visible lg:px-0 lg:pb-0">
          {featured.map((s, i) => {
            const isActive = i === active;
            return (
              <li
                key={s.name}
                onMouseEnter={() => setActive(i)}
                className={`relative w-64 shrink-0 snap-start overflow-hidden rounded-[1.75rem] transition-[flex-grow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:w-auto lg:min-w-0 lg:shrink ${
                  isActive ? "lg:grow-[6]" : "lg:grow"
                } ${toneFor(s.color)}`}
              >
                <button
                  type="button"
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-label={`${s.name}, ${s.role}`}
                  aria-pressed={isActive}
                  className="absolute inset-0 z-20 hidden rounded-[1.75rem] focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-ink lg:block"
                />
                <div className="relative aspect-[4/5] lg:absolute lg:inset-0 lg:aspect-auto">
                  <Image
                    src={upscaled(s.image)}
                    alt={s.name}
                    fill
                    sizes="(min-width: 1024px) 36rem, 16rem"
                    className={`object-cover object-top transition-[filter,transform] duration-700 ${
                      isActive ? "lg:scale-100 lg:grayscale-0" : "lg:scale-105 lg:grayscale"
                    }`}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent" />
                </div>

                {/* Collapsed: vertical name */}
                <p
                  aria-hidden
                  className={`type-heading absolute bottom-6 left-1/2 hidden origin-center -translate-x-1/2 text-2xl whitespace-nowrap text-white transition-opacity duration-300 [writing-mode:vertical-rl] rotate-180 lg:block ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </p>

                {/* Expanded: full name + role */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-5 text-white transition-all duration-500 lg:p-7 ${
                    isActive ? "lg:translate-y-0 lg:opacity-100" : "lg:translate-y-4 lg:opacity-0"
                  }`}
                >
                  <p className="type-heading text-2xl lg:text-4xl">{s.name}</p>
                  <p className="mt-2 line-clamp-2 max-w-sm text-sm text-white/80">{s.role}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

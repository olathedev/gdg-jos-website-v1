"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { COMMUNITY_URL, faqs, gallery } from "@/data/devfest26";
import { Eyebrow, QuarterCircle, Reveal, Star4 } from "./ui";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 bg-p-green/50 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow className="text-ink/60">FAQ</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="type-wide mt-5 text-[clamp(2.4rem,4.8vw,4.25rem)]">
              Got <span className="text-g-green">questions?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="relative mt-10 hidden max-w-md lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] rounded-tr-[6rem]">
              <Image src={gallery.keynote} alt="A speaker addressing the DevFest Jos audience" fill sizes="28rem" className="object-cover" />
            </div>
            <Star4 className="absolute -top-5 -left-5 w-14 text-g-blue" />
            <QuarterCircle className="absolute -right-4 -bottom-4 w-16 -rotate-90 text-g-yellow" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-ink/70">
              Still curious?{" "}
              <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-4 hover:text-g-blue focus-visible:outline-2 focus-visible:outline-g-blue">
                Ask the GDG Jos community
              </a>
              .
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ul className="border-t border-ink/15">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              const panelId = `${baseId}-panel-${i}`;
              const btnId = `${baseId}-btn-${i}`;
              return (
                <li key={f.q} className="border-b border-ink/15">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue sm:text-xl"
                    >
                      {f.q}
                      <span
                        aria-hidden
                        className={`grid size-10 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                          isOpen ? "rotate-45 bg-ink text-white" : "bg-white text-ink"
                        }`}
                      >
                        <Plus className="size-5" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden" inert={!isOpen}>
                      <p className="max-w-2xl pr-14 pb-6 text-ink/75">{f.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

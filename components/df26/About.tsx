"use client";

import Image from "next/image";
import { Mic, Presentation, Route, Users } from "lucide-react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { gallery, pastStats } from "@/data/devfest26";
import { Braces, Eyebrow, QuarterCircle, Reveal, Squiggle, Star4 } from "./ui";

const statStyle = {
  blue: { card: "bg-g-blue text-white", icon: Users },
  green: { card: "bg-g-green text-white", icon: Mic },
  yellow: { card: "bg-g-yellow text-ink", icon: Presentation },
  red: { card: "bg-g-red text-white", icon: Route },
} as const;

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow className="text-ink/60">About DevFest</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-wide mt-5 text-[clamp(2.4rem,4.8vw,4.25rem)] text-balance">
                <span className="text-g-blue">Made on the Plateau.</span>{" "}
                <span className="text-ink">Built for builders.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/75">
                DevFest Jos is where the Plateau&apos;s tech community comes together once a year. It&apos;s a full day
                of talks, hands-on workshops and real conversations with people building with Google technologies,
                from first-time coders to engineers shipping to millions.
              </p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/75">
                This year we&apos;re going all in on building in the agentic era: how to build with AI, keep it
                secure and scale it beyond the demo.
              </p>
            </Reveal>
          </div>

          {/* Photo collage */}
          <Reveal delay={0.1} className="relative mx-auto w-full max-w-xl">
            <div className="relative aspect-[5/6]">
              <div className="absolute top-0 left-0 h-[72%] w-[70%] overflow-hidden rounded-[2rem] bg-ink/10">
                <Image src={gallery.speaker} alt="A speaker on stage at DevFest Jos" fill sizes="(min-width: 1024px) 28rem, 70vw" className="object-cover" />
              </div>
              <div className="absolute right-0 bottom-0 h-[55%] w-[58%] overflow-hidden rounded-[2rem] ring-8 ring-paper">
                <Image src={gallery.selfie} alt="Attendees taking a selfie during a session" fill sizes="(min-width: 1024px) 22rem, 58vw" className="object-cover" />
              </div>
              <Braces className="absolute top-[6%] -right-2 w-24 text-g-green sm:w-28" />
              <Star4 className="absolute bottom-[38%] left-[64%] w-12 text-g-yellow" />
              <QuarterCircle className="absolute -bottom-2 left-[6%] w-20 rotate-90 text-g-red" />
              <Squiggle className="absolute -top-6 left-[38%] w-24 text-g-blue" />
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <div ref={ref} className="mt-24">
          <Reveal>
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-ink/60 uppercase">DevFest Jos 2025, by the numbers</p>
          </Reveal>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {pastStats.map((s, i) => {
              const { card, icon: Icon } = statStyle[s.tone];
              return (
                <Reveal as="li" key={s.label} delay={i * 0.06} className={`group relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7 ${card}`}>
                  <Icon aria-hidden strokeWidth={1.25} className="absolute -right-6 -bottom-6 size-36 opacity-25 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 sm:size-44" />
                  <p className="type-condensed relative text-[clamp(3.5rem,8vw,6.5rem)]">
                    <CountUp end={inView ? s.value : 0} duration={2} preserveValue />
                    {s.suffix}
                  </p>
                  <p className="relative mt-3 text-xl font-bold">{s.label}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

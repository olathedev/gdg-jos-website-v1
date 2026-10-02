"use client";

import { motion as m } from "framer-motion";
import { event, heroPills, ticketHref, ticketLabel } from "@/data/devfest26";
import Countdown from "./Countdown";
import PhysicsPills from "./PhysicsPills";
import { Eyebrow, PillLink } from "./ui";

const line = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const } }),
};

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d } }),
};

export default function Hero() {
  const when = event.dateLabel ?? "Date drops soon";
  const where = event.venue ? `${event.venue}, ${event.city}` : `${event.city}, ${event.region}`;

  return (
    <section id="top" className="relative isolate h-svh min-h-[680px] overflow-hidden bg-ink text-white">
      <PhysicsPills pills={heroPills} />

      {/* Content sits above the pills but lets drags pass through everywhere except the buttons. */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 pt-24 pb-36 text-center sm:pb-40">
        <m.div initial="hidden" animate="show" custom={0} variants={fade}>
          <Eyebrow className="text-white/70">DevFest Jos 2026</Eyebrow>
        </m.div>

        <h1 className="type-condensed mt-6 text-[clamp(3.6rem,12vw,10rem)]">
          {["Build for the", "agentic era"].map((t, i) => (
            <span key={t} className="block overflow-hidden pb-[0.06em]">
              <m.span className="block" initial="hidden" animate="show" custom={i} variants={line}>
                {t}
              </m.span>
            </span>
          ))}
        </h1>

        <m.p
          initial="hidden"
          animate="show"
          custom={0.55}
          variants={fade}
          className="mt-6 max-w-xl text-base text-balance text-white/75 sm:text-lg"
        >
          A day of talks, workshops and community for developers, designers and founders across the
          Plateau. Hosted by Google Developer Groups Jos.
        </m.p>

        <m.div
          initial="hidden"
          animate="show"
          custom={0.7}
          variants={fade}
          className="mt-8 flex flex-col items-center gap-5"
        >
          <div className="pointer-events-auto flex flex-wrap justify-center gap-3">
            <PillLink href={ticketHref} size="lg">
              {ticketLabel}
            </PillLink>
            <PillLink href={event.sponsorUrl} variant="ghost" size="lg">
              Become a sponsor
            </PillLink>
          </div>
          {event.startsAt && <Countdown to={event.startsAt} />}
          <p className="font-mono text-xs tracking-[0.14em] text-balance text-white/60 uppercase">
            {when} <span aria-hidden className="mx-2 text-g-yellow">✦</span> {where}
          </p>
        </m.div>
      </div>

      <p aria-hidden className="pointer-events-none absolute top-24 right-6 hidden font-mono text-[11px] tracking-widest text-white/40 uppercase lg:block">
        Psst, grab a pill
      </p>
    </section>
  );
}

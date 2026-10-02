"use client";

import { motion as m } from "framer-motion";
import { event, gallery, heroPills, mapsHref, ticketHref, ticketLabel } from "@/data/devfest26";
import Countdown from "./Countdown";
import PhotoBackdrop from "./PhotoBackdrop";
import PhysicsPills from "./PhysicsPills";
import { PillLink } from "./ui";

const line = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const } }),
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
      <PhotoBackdrop src={gallery.stage} priority position="center 35%" dim="bg-ink/[0.88]" />
      <PhysicsPills pills={heroPills} />

      {/* Content sits above the pills but lets drags pass through everywhere except links. */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-5 pt-20 pb-40 text-center sm:pb-44">
        <m.div initial="hidden" animate="show" custom={0} variants={fade}>
          <a
            href={mapsHref ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white/85 ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-g-blue"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-h-green" />
            {when} · {where}
          </a>
        </m.div>

        <h1 className="type-heading mt-6 text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.98]">
          {["Build for the", "agentic era"].map((t, i) => (
            <span key={t} className="block overflow-hidden pb-[0.08em]">
              <m.span className={`block ${i === 1 ? "text-h-blue" : ""}`} initial="hidden" animate="show" custom={i} variants={line}>
                {t}
              </m.span>
            </span>
          ))}
        </h1>

        <m.p initial="hidden" animate="show" custom={0.5} variants={fade} className="mt-5 max-w-lg text-base text-balance text-white/70 sm:text-lg">
          A day of talks, workshops and community for developers, designers and founders across the Plateau.
        </m.p>

        <m.div initial="hidden" animate="show" custom={0.65} variants={fade} className="mt-8 flex flex-col items-center gap-6">
          <div className="pointer-events-auto flex flex-wrap justify-center gap-3">
            <PillLink href={ticketHref} size="lg" icon={false}>
              {ticketLabel}
            </PillLink>
            <PillLink href={event.sponsorUrl} variant="ghost" size="lg">
              Become a sponsor
            </PillLink>
          </div>
          {event.startsAt && <Countdown to={event.startsAt} />}
        </m.div>
      </div>
    </section>
  );
}

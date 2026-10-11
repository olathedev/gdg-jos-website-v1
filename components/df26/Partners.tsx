import Image from "next/image";
import type { CSSProperties } from "react";
import { event, partners } from "@/data/devfest26";
import { Eyebrow, PillLink, Reveal, Ring } from "./ui";

const offers = [
  {
    title: "Sponsor",
    pitch: "Put your brand in front of the Plateau's most curious builders.",
    points: [
      "Reach hundreds of developers, designers and founders",
      "Visibility on stage, on screens and in swag",
      "Host a workshop or sponsor a track",
      "Back the community that's training tomorrow's hires",
    ],
    cta: "Become a sponsor",
    card: "bg-white text-ink",
    bullet: "bg-g-blue",
    button: "dark" as const,
  },
  {
    title: "Exhibit",
    pitch: "Show what you're building and let people try it on the spot.",
    points: [
      "Live demos at your own booth",
      "Real feedback from real users",
      "Collect leads and meet future teammates",
      "Shout-outs across our socials and recap content",
    ],
    cta: "Become an exhibitor",
    card: "bg-ink text-white",
    bullet: "bg-h-yellow",
    button: "light" as const,
  },
];

export default function Partners() {
  return (
    <section id="partners" className="relative isolate scroll-mt-24 overflow-hidden bg-g-blue py-24 text-ink sm:py-32">
      <Ring className="absolute -top-40 -right-40 -z-10 w-[34rem] text-h-blue/40" />
      <Ring className="absolute -bottom-56 -left-48 -z-10 w-[30rem] text-white/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Reveal>
          <Eyebrow className="text-ink">Partner with us</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="type-heading mt-5 max-w-3xl text-[clamp(2rem,3.6vw,3.25rem)]">Want a piece of the action?</h2>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {offers.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08} className={`flex flex-col rounded-[2rem] p-7 sm:p-10 ${o.card}`}>
              <h3 className="type-heading text-4xl sm:text-5xl">{o.title}</h3>
              <p className="mt-4 max-w-md text-lg opacity-80">{o.pitch}</p>
              <ul className="mt-7 space-y-3">
                {o.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${o.bullet}`} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <PillLink href={event.sponsorUrl} variant={o.button} size="lg" className="mt-10 self-start">
                {o.cta}
              </PillLink>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="mx-auto mt-20 max-w-7xl px-4 sm:px-8">
        <Reveal className="rounded-[2rem] bg-white p-3 sm:p-4">
          {/* <p className="text-xs tracking-[0.12em] uppercase">Backed in 2025 by</p> */}
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pt-5 pb-7 sm:px-6 sm:pt-7 sm:pb-9">
            <h3 className="type-heading text-3xl sm:text-4xl">In good company</h3>
            <p className="max-w-sm text-sm text-ink/60">The organisations helping us bring DevFest to the Plateau.</p>
          </div>
          {/* Hairline grid: the 1px gap shows the list's tint through as dividers. */}
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] bg-ink/8 ring-1 ring-ink/8 md:grid-cols-4">
            {partners.map((p) => (
              <li key={p.name} className="group relative flex h-32 items-center justify-center bg-white sm:h-40">
                {/* Equal-area sizing: width grows with √aspect so wide wordmarks and square marks carry the same visual weight. */}
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={p.w}
                  height={p.h}
                  style={{ "--s": Math.sqrt(p.w / p.h) * (p.scale ?? 1) } as CSSProperties}
                  className="h-auto w-[calc(var(--s)*3.75rem)] max-w-[78%] transition-transform duration-300 ease-out group-hover:scale-[1.06] sm:w-[calc(var(--s)*4.5rem)]"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-3 hidden translate-y-1 text-center text-[11px] font-medium text-ink/45 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
                  {p.name}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

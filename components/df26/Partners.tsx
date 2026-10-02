import Image from "next/image";
import { event, partners } from "@/data/devfest26";
import { Eyebrow, PillLink, Reveal, Ring, Star4 } from "./ui";

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
      <Star4 className="absolute top-24 left-[46%] -z-10 hidden w-16 text-h-yellow lg:block" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Reveal>
          <Eyebrow className="text-ink">Partner with us</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="type-heading mt-5 max-w-3xl text-[clamp(2.4rem,4.8vw,4.25rem)]">Want a piece of the action?</h2>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {offers.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08} className={`flex flex-col rounded-[2rem] p-7 sm:p-10 ${o.card}`}>
              <h3 className="type-condensed text-6xl sm:text-7xl">{o.title}</h3>
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

      {/* Past partners */}
      <div className="mt-20">
        <p className="px-4 text-center font-mono text-xs tracking-[0.18em] text-ink uppercase">
          Backed in 2025 by
        </p>
        <div className="mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <ul className="flex w-max animate-marquee gap-3 [--marquee-duration:60s] hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((p, i) => (
              <li
                key={`${p.name}-${i}`}
                aria-hidden={i >= partners.length}
                className="grid h-24 w-44 shrink-0 place-items-center rounded-2xl bg-white px-6"
              >
                <Image src={p.logo} alt={i >= partners.length ? "" : p.name} width={140} height={56} loading="eager" className="max-h-12 w-auto object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

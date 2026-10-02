import { COMMUNITY_URL, WHATSAPP_URL, navLinks, socials, ticketHref, ticketLabel } from "@/data/devfest26";
import { Braces, Logo, PillLink, Reveal, Star4 } from "./ui";

export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden bg-h-yellow py-24 text-center text-ink sm:py-28">
      <Braces className="absolute top-1/2 -left-10 -z-10 w-56 -translate-y-1/2 text-g-yellow sm:w-72" />
      <Star4 className="absolute top-12 right-[10%] -z-10 w-16 text-g-blue sm:w-20" />
      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <p className="font-mono text-xs font-semibold tracking-[0.18em] uppercase">Don&apos;t sleep on it</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="type-condensed mt-4 text-[clamp(3.5rem,10vw,8rem)]">Be first in line</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-lg text-lg">
            Grab your ticket now, then join the community for speaker drops, schedule updates and giveaways.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PillLink href={ticketHref} variant="dark" size="lg">
              {ticketLabel}
            </PillLink>
            <PillLink href={WHATSAPP_URL} variant="outline" size="lg">
              Join the WhatsApp
            </PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const linkCls =
  "rounded text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue";

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-ink pt-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-white/70">
              DevFest Jos 2026 is hosted by Google Developer Groups Jos. We build community, learn in public and help
              shape the future of tech on the Plateau.
            </p>
            <PillLink href={ticketHref} className="mt-7">
              {ticketLabel}
            </PillLink>
          </div>
          <nav aria-label="Footer">
            <p className="font-mono text-xs tracking-[0.18em] text-white/60 uppercase">Explore</p>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkCls}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  GDG Jos community
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-white/60 uppercase">Follow</p>
            <ul className="mt-5 space-y-3">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/15 py-6 text-sm text-white/60 sm:flex-row">
          <p>© 2026 GDG Jos. All rights reserved.</p>
          <p>Part of the global DevFest series by Google Developer Groups.</p>
        </div>
      </div>

      {/* Oversized wordmark */}
      <p
        aria-hidden
        className="type-condensed -mb-[0.16em] text-center text-[19vw] leading-none whitespace-nowrap select-none"
      >
        <span className="text-g-blue">D</span>
        <span className="text-g-red">e</span>
        <span className="text-g-yellow">v</span>
        <span className="text-g-green">F</span>
        <span className="text-white/10">est Jos</span>
      </p>
    </footer>
  );
}

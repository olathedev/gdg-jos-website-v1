import TierCards from "@/components/tickets/TierCards";
import { event } from "@/data/devfest26";
import { Eyebrow, Reveal } from "./ui";

export default function Tickets({ heading = true }: { heading?: boolean }) {
  return (
    <section id="tickets" className="scroll-mt-24 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {heading && (
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
            <Reveal>
              <Eyebrow className="justify-center text-ink/60">Tickets</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-heading mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
                Grab your <span className="text-g-blue">spot.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-lg text-ink/70">
                {event.dateLabel} · {event.venue}, {event.city}. Your ticket lands in your inbox with a QR code for the door.
              </p>
            </Reveal>
          </div>
        )}
        <Reveal delay={0.1}>
          <TierCards />
        </Reveal>
      </div>
    </section>
  );
}

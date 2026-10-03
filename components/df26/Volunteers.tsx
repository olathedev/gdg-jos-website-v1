import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VolunteerPreview, crewCount } from "@/components/volunteers/VolunteerCard";
import { event } from "@/data/devfest26";
import { Eyebrow, PillLink, Reveal } from "./ui";

export default function Volunteers() {
  return (
    <section id="volunteers" className="scroll-mt-24 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow className="text-ink/60">Volunteers</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-heading mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
                The people who make it <span className="text-g-yellow">happen.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-lg text-ink/70">
                Meet the {crewCount}-strong 2026 crew behind registration, media, design, speakers and partnerships.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="flex flex-wrap items-center gap-3">
            <PillLink href={event.volunteerUrl} variant="dark" size="lg">
              Volunteer with us
            </PillLink>
            <Link
              href="/volunteers"
              className="group inline-flex h-12 items-center gap-1.5 rounded-full px-4 text-[15px] font-medium text-ink hover:text-g-blue focus-visible:outline-2 focus-visible:outline-g-blue"
            >
              See all volunteers <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <VolunteerPreview />
        </Reveal>
      </div>
    </section>
  );
}

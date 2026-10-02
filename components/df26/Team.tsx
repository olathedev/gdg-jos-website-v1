import Image from "next/image";
import { upscaled } from "@/lib/cloudinary-loader";
import Link from "next/link";
import { organisers } from "@/data/data";
import { event } from "@/data/devfest26";
import { Eyebrow, PillLink, Reveal } from "./ui";

const tones = ["bg-p-blue", "bg-p-red", "bg-p-yellow", "bg-p-green"];

export default function Team() {
  return (
    <section id="team" className="scroll-mt-24 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow className="text-ink/60">The crew</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-heading mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
                Run by the community, <span className="text-g-blue">for the community.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="flex flex-wrap items-center gap-3">
            <PillLink href={event.volunteerUrl} variant="dark" size="lg">
              Volunteer with us
            </PillLink>
            <Link
              href="/devfest/team"
              className="inline-flex h-12 items-center rounded-full px-4 text-[15px] font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-g-blue"
            >
              Meet the 2025 team
            </Link>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {organisers.map((o, i) => {
            const [title, role] = o.role.split("\n");
            return (
              <Reveal as="li" key={o.name} delay={i * 0.06} className={`group overflow-hidden rounded-[1.75rem] p-2 ${tones[i % tones.length]}`}>
                <div className="relative aspect-square overflow-hidden rounded-[1.4rem]">
                  <Image src={upscaled(o.image)} alt={o.name} fill sizes="(min-width: 1024px) 18rem, 45vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="px-3 pt-4 pb-3">
                  <p className="text-lg leading-tight font-bold text-ink">{o.name}</p>
                  <p className="mt-1 text-sm text-ink/70">{role ?? title}</p>
                  {role && <p className="mt-0.5 text-xs text-ink/60">{title}</p>}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

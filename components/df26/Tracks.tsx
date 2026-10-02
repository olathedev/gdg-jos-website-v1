import { ArrowUpRight } from "lucide-react";
import { tracks } from "@/data/devfest26";
import { Eyebrow, Reveal } from "./ui";

const fill = {
  blue: "before:bg-g-blue",
  green: "before:bg-g-green",
  yellow: "before:bg-g-yellow",
  red: "before:bg-g-red",
  sky: "before:bg-h-blue",
} as const;

const dot = {
  blue: "bg-g-blue",
  green: "bg-g-green",
  yellow: "bg-g-yellow",
  red: "bg-g-red",
  sky: "bg-h-blue",
} as const;

export default function Tracks() {
  return (
    <section id="tracks" className="scroll-mt-24 bg-ink py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <Eyebrow className="text-white/60">Content tracks</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-wide mt-5 text-[clamp(2.4rem,4.8vw,4.25rem)]">
                Five tracks.
                <br />
                <span className="text-h-yellow">One big day.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-lg text-white/70">
              Pick a lane or hop between rooms. Every track mixes talks with hands-on sessions you can take home.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 border-t border-white/15">
          {tracks.map((t, i) => (
            <Reveal as="li" key={t.no} delay={i * 0.05}>
              <div
                className={`group relative isolate grid gap-4 overflow-hidden border-b border-white/15 px-2 py-8 transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(.22,1,.36,1)] hover:text-ink hover:before:scale-y-100 sm:px-6 md:grid-cols-[5rem_1.2fr_1fr_auto] md:items-center ${fill[t.tone]}`}
              >
                <span className="flex items-center gap-3 font-mono text-sm text-white/50 transition-colors group-hover:text-ink/70">
                  <span aria-hidden className={`size-2.5 rounded-full ${dot[t.tone]} group-hover:bg-ink`} />
                  {t.no}
                </span>
                <h3 className="type-condensed text-[clamp(2.75rem,6vw,5rem)]">{t.title}</h3>
                <div>
                  <p className="text-white/75 transition-colors group-hover:text-ink/80">{t.blurb}</p>
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${t.title} topics`}>
                    {t.tags.map((tag) => (
                      <li key={tag} className="rounded-full border border-white/20 px-3 py-1 font-mono text-xs uppercase transition-colors group-hover:border-ink/30">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
                <ArrowUpRight aria-hidden className="hidden size-10 transition-transform duration-300 group-hover:rotate-45 md:block" />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

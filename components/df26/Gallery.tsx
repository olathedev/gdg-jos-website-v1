"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { gallery } from "@/data/devfest26";
import { Braces, Eyebrow, Reveal } from "./ui";

function Photo({ src, alt, className = "", sizes }: { src: string; alt: string; className?: string; sizes: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-[1.75rem] bg-ink/10 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
    </div>
  );
}

function RecapVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Autoplay only while visible, and never for reduced-motion users.
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] bg-ink ${className}`}>
      <video
        ref={ref}
        src={gallery.recap}
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        aria-label="Highlights from DevFest Jos 2024"
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute top-4 left-4 rounded-full bg-g-red px-3 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
        ● 2024 recap
      </span>
    </div>
  );
}

export default function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-24 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <Reveal>
              <Eyebrow className="text-ink/60">Gallery</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="type-heading mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
                We&apos;ve done this before.
                <br />
                <span className="text-g-red">2026 goes harder.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="flex flex-wrap gap-2">
            {gallery.archives.map((a) =>
              a.href ? (
                <a
                  key={a.label}
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-g-blue"
                >
                  {a.label} photos <ArrowUpRight aria-hidden className="size-4" />
                </a>
              ) : (
                <span key={a.label} className="inline-flex h-11 items-center gap-1.5 rounded-full border border-dashed border-ink/20 px-4 text-sm font-semibold text-ink/50">
                  {a.label} photos · soon
                </span>
              ),
            )}
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:grid-cols-4">
          <Photo src={gallery.group} alt="The DevFest Jos 2025 group photo outside the venue" sizes="(min-width: 1024px) 50vw, 100vw" className="col-span-2 row-span-2" />
          <RecapVideo className="row-span-2" />
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-h-yellow p-5 text-ink">
            <Braces className="absolute -right-4 -bottom-6 w-28 text-g-yellow" />
            <p className="text-xs font-semibold tracking-wider uppercase">Next up</p>
            <p className="type-heading relative text-4xl sm:text-5xl">
              Jos
              <br />
              &apos;26
            </p>
          </div>
          <Photo src={gallery.wtm} alt="Attendees chatting between sessions" sizes="(min-width: 1024px) 25vw, 50vw" />
          <Photo src={gallery.audience} alt="A full hall during a DevFest Jos session" sizes="(min-width: 1024px) 50vw, 100vw" className="col-span-2" />
          <Photo src={gallery.swag} alt="Volunteers checking attendees in at the registration desk" sizes="(min-width: 1024px) 25vw, 50vw" />
          <Photo src={gallery.logoG} alt="An attendee coding on his laptop during a workshop" sizes="(min-width: 1024px) 25vw, 50vw" />
        </Reveal>
      </div>
    </section>
  );
}

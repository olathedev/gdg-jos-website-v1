import type { Metadata } from "next";
import Image from "next/image";
import DpMaker from "@/components/dp/DpMaker";
import Footer from "@/components/df26/Footer";
import Nav from "@/components/df26/Nav";
import { Braces, Divider, QuarterCircle, Ring, Star4 } from "@/components/df26/ui";
import { gallery } from "@/data/devfest26";

export const metadata: Metadata = {
  title: "DP Maker · DevFest Jos 2026",
  description: "Make your DevFest Jos 2026 DP and tell everyone you'll be there.",
  openGraph: { title: "Make your DevFest Jos 2026 DP", url: "/dp" },
};

const strip = [
  { src: gallery.selfie, alt: "Attendees taking a selfie at DevFest Jos", rotate: "-rotate-3", y: "translate-y-6" },
  { src: gallery.audience, alt: "The audience during a session", rotate: "rotate-2", y: "" },
  { src: gallery.speaker, alt: "A speaker on stage", rotate: "-rotate-2", y: "translate-y-8" },
  { src: gallery.wtm, alt: "Attendees chatting between sessions", rotate: "rotate-3", y: "translate-y-2" },
];

export default function DpPage() {
  return (
    <>
      <Nav onLight />
      <main className="overflow-x-clip bg-cream">
        {/* Hero (no photo header) */}
        <section className="relative isolate px-5 pt-32 pb-10 text-center sm:pt-40">
          <Star4 className="absolute top-28 left-[6%] -z-10 w-14 text-h-red sm:w-20" />
          <QuarterCircle className="absolute top-24 right-[5%] -z-10 w-16 rotate-180 text-g-green sm:w-24" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold ring-1 ring-ink/10">
            <span className="text-g-blue">{"{"}</span>DevFest<span className="text-g-yellow">{"}"}</span> Jos
          </span>
          <h1 className="type-heading mx-auto mt-6 max-w-4xl text-[clamp(2.75rem,8vw,6rem)] leading-[0.95] uppercase">
            DevFest Jos
            <br />
            DP Maker
          </h1>
          <p className="mt-5 text-lg text-ink/75 sm:text-xl">Tell everyone you&apos;ll be there!</p>
          <a
            href="#create"
            className="mt-8 inline-flex h-14 items-center rounded-full bg-g-yellow px-9 text-[15px] font-bold tracking-wide text-ink uppercase ring-[3px] ring-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue"
          >
            Create yours!
          </a>
        </section>

        {/* Tilted photo strip with stickers */}
        <div aria-hidden className="relative mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 pt-6 pb-16 sm:gap-6">
          <Braces className="absolute top-1/2 left-0 z-10 hidden w-24 -translate-y-1/2 text-p-green md:block" />
          {strip.map((p, i) => (
            <div
              key={p.src}
              className={`relative aspect-[4/3] w-[44%] shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg shadow-ink/10 sm:w-[24%] ${p.rotate} ${p.y} ${i > 1 ? "hidden sm:block" : ""}`}
            >
              <div className="relative size-full overflow-hidden rounded-xl">
                <Image src={p.src} alt="" fill sizes="(min-width: 640px) 24vw, 44vw" className="object-cover" />
              </div>
            </div>
          ))}
          <Ring className="absolute right-[2%] bottom-6 z-10 hidden w-20 text-h-red md:block" />
          <Star4 className="absolute top-2 left-[47%] z-10 w-10 text-g-blue sm:w-14" />
        </div>

        {/* Generator */}
        <section id="create" className="scroll-mt-24 px-4 pb-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="type-heading text-center text-[clamp(1.75rem,3.4vw,2.75rem)]">Make your DP</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-ink/65">
              Add your photo, fit it in the frame, then download or share it.
            </p>
            <div className="mt-10">
              <DpMaker />
            </div>
          </div>
        </section>
        <Divider />
      </main>
      <Footer />
    </>
  );
}

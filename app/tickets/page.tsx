import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Countdown from "@/components/df26/Countdown";
import Faq from "@/components/df26/Faq";
import Footer from "@/components/df26/Footer";
import Nav from "@/components/df26/Nav";
import PhotoBackdrop from "@/components/df26/PhotoBackdrop";
import Tickets from "@/components/df26/Tickets";
import { Divider } from "@/components/df26/ui";
import { event, gallery, mapsHref } from "@/data/devfest26";

const description = `${event.dateLabel} at ${event.venue}, ${event.city}. Free Regular registration, VIP ₦8,000, My Padi ₦15,000 for two. Get your DevFest Jos 2026 ticket.`;

export const metadata: Metadata = {
  title: "Tickets · DevFest Jos 2026",
  description,
  openGraph: {
    title: "Get your DevFest Jos 2026 ticket",
    description,
    url: "/tickets",
    images: ["https://res.cloudinary.com/dxssytv0p/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1758289190/devfestbanner_v12utp.jpg"],
  },
  twitter: { card: "summary_large_image", title: "Get your DevFest Jos 2026 ticket", description },
};

const details = [
  { label: "When", value: event.dateLabel ?? "", sub: "Doors open 9:00 AM" },
  { label: "Where", value: event.venue ?? "", sub: [event.address, event.city].filter(Boolean).join(", "), href: mapsHref },
  { label: "Entry", value: "QR code", sub: "On your phone or printed. One code per person." },
];

export default function TicketsPage() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <header className="relative isolate overflow-hidden bg-ink pt-28 pb-16 text-center text-white sm:pt-36 sm:pb-20">
          <PhotoBackdrop src={gallery.stage} priority position="center 35%" dim="bg-ink/[0.86]" />
          <div className="mx-auto max-w-3xl px-5">
            <p className="text-sm text-white/70">
              {event.dateLabel} · {event.venue}, {event.city}
            </p>
            <h1 className="type-heading mt-3 text-[clamp(2.5rem,6vw,4.5rem)]">
              DevFest Jos 2026 <span className="text-h-blue">tickets</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/70 sm:text-lg">
              A full day of talks, workshops and community. Pick your ticket below.
            </p>
            {event.startsAt && (
              <div className="mt-8 flex justify-center">
                <Countdown to={event.startsAt} />
              </div>
            )}
          </div>
        </header>
        <Divider />

        <Tickets heading={false} />

        {/* Event details, laid out like a boarding pass */}
        <section aria-label="Event details" className="bg-paper px-4 pb-20 sm:px-8 sm:pb-28">
          <dl className="mx-auto grid max-w-6xl divide-y-2 divide-dashed divide-ink/10 rounded-3xl bg-white px-6 ring-1 ring-ink/[0.08] md:grid-cols-3 md:divide-x-2 md:divide-y-0 md:px-0">
            {details.map((d) => (
              <div key={d.label} className="py-6 md:px-8 md:py-7">
                <dt className="text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase">{d.label}</dt>
                <dd className="type-heading mt-2 text-xl">{d.value}</dd>
                <dd className="mt-1 text-sm text-ink/60">{d.sub}</dd>
                {d.href && (
                  <dd className="mt-3">
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-g-blue focus-visible:outline-2 focus-visible:outline-g-blue"
                    >
                      Get directions <ArrowUpRight aria-hidden className="size-4" />
                    </a>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>

        <Faq />
        <Divider />
      </main>
      <Footer />
    </>
  );
}

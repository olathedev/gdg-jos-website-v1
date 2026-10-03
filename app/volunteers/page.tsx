import type { Metadata } from "next";
import Footer from "@/components/df26/Footer";
import Nav from "@/components/df26/Nav";
import PhotoBackdrop from "@/components/df26/PhotoBackdrop";
import { Divider, PillLink } from "@/components/df26/ui";
import VolunteerGrid from "@/components/volunteers/VolunteerGrid";
import { event, gallery } from "@/data/devfest26";

export const metadata: Metadata = {
  title: "Volunteers · DevFest Jos 2026",
  description: "Meet the volunteers behind DevFest Jos: media, logistics and partnerships teams from the GDG Jos community.",
  openGraph: { title: "Meet the DevFest Jos volunteers", url: "/volunteers" },
};

export default function VolunteersPage() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <header className="relative isolate overflow-hidden bg-ink pt-28 pb-16 text-center text-white sm:pt-36 sm:pb-20">
          <PhotoBackdrop src={gallery.wtm} priority position="center 40%" dim="bg-ink/[0.86]" />
          <div className="mx-auto max-w-3xl px-5">
            <h1 className="type-heading text-[clamp(2.5rem,6vw,4.5rem)]">
              Meet the <span className="text-h-yellow">volunteers</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/70 sm:text-lg">
              The crew behind registration, speakers, media, design and partners. DevFest Jos doesn&apos;t happen without them.
            </p>
            <div className="mt-8 flex justify-center">
              <PillLink href={event.volunteerUrl} size="lg">
                Volunteer with us
              </PillLink>
            </div>
          </div>
        </header>
        <Divider />

        <section className="bg-paper py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <VolunteerGrid />
          </div>
        </section>
        <Divider />
      </main>
      <Footer />
    </>
  );
}

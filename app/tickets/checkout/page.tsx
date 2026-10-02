import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutForm from "@/components/tickets/CheckoutForm";
import Nav from "@/components/df26/Nav";
import PhotoBackdrop from "@/components/df26/PhotoBackdrop";
import { event, gallery } from "@/data/devfest26";
import { isTierId } from "@/lib/tickets/tiers";

export const metadata: Metadata = {
  title: "Get tickets · DevFest Jos 2026",
  description: "Register or buy your DevFest Jos 2026 ticket.",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier } = await searchParams;

  return (
    <>
      <Nav />
      <main className="min-h-svh bg-paper pb-40 lg:pb-24">
        <div className="relative isolate overflow-hidden bg-ink pt-24 pb-20 text-white sm:pt-32 sm:pb-24">
          <PhotoBackdrop src={gallery.audience} priority position="center 40%" />
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <Link
              href="/#tickets"
              className="inline-flex items-center gap-1.5 rounded-full text-sm text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue"
            >
              <ArrowLeft aria-hidden className="size-4" /> Tickets
            </Link>
            <h1 className="type-heading mt-4 text-[clamp(2rem,5vw,3.5rem)]">Get your ticket</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              {event.dateLabel} · {event.venue}, {event.city}
            </p>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-3 sm:-mt-12 sm:px-8">
          <CheckoutForm initialTier={isTierId(tier) ? tier : "vip"} />
        </div>
      </main>
    </>
  );
}

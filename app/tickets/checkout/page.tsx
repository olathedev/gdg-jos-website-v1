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
        <div className="relative isolate overflow-hidden bg-ink pt-32 pb-28 text-white sm:pt-36">
          <PhotoBackdrop src={gallery.audience} priority position="center 40%" />
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <Link
              href="/#tickets"
              className="inline-flex items-center gap-2 rounded-full text-sm text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue"
            >
              <ArrowLeft aria-hidden className="size-4" /> Back to tickets
            </Link>
            <h1 className="type-condensed mt-6 text-[clamp(3.5rem,9vw,7rem)]">Get your ticket</h1>
            <p className="mt-4 font-mono text-xs tracking-[0.14em] text-white/60 uppercase">
              {event.name} <span aria-hidden className="mx-2 text-g-yellow">✦</span> {event.dateLabel}{" "}
              <span aria-hidden className="mx-2 text-g-yellow">✦</span> {event.venue}, {event.city}
            </p>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:px-8">
          <CheckoutForm initialTier={isTierId(tier) ? tier : "vip"} />
        </div>
      </main>
    </>
  );
}

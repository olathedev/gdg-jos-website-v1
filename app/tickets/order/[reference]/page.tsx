import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, CircleAlert, Download } from "lucide-react";
import Nav from "@/components/df26/Nav";
import PhotoBackdrop from "@/components/df26/PhotoBackdrop";
import { gallery } from "@/data/devfest26";
import PendingVerifier from "@/components/tickets/PendingVerifier";
import TicketCard from "@/components/tickets/TicketCard";
import { calendarUrl } from "@/lib/tickets/calendar";
import { ConfigError } from "@/lib/tickets/db";
import { getOrder } from "@/lib/tickets/orders";
import { formatNaira, tiers } from "@/lib/tickets/tiers";

export const metadata: Metadata = {
  title: "Your tickets · DevFest Jos 2026",
  robots: { index: false, follow: false },
};

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue";

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!/^DFJ26-[A-Z0-9-]{8,40}$/.test(reference)) notFound();

  let data: Awaited<ReturnType<typeof getOrder>>;
  try {
    data = await getOrder(reference);
  } catch (e) {
    if (e instanceof ConfigError) return <Shell title="Tickets unavailable"><Notice title="Ticketing isn't set up yet" body="Please try again shortly." /></Shell>;
    throw e;
  }
  if (!data) notFound();
  const { order, tickets } = data;
  const tier = tiers[order.tier];

  if (order.status === "pending") {
    return (
      <Shell title="Almost there">
        <PendingVerifier reference={order.reference} />
      </Shell>
    );
  }

  if (order.status === "failed") {
    return (
      <Shell title="Payment not completed">
        <Notice
          title="We couldn't confirm this payment"
          body={`No tickets were issued for order ${order.reference}. If you were charged, contact us with this reference and we'll sort it out.`}
          action={<Link href={`/tickets/checkout?tier=${order.tier}`} className={`${btn} mt-6 bg-ink text-white hover:bg-g-blue`}>Try again</Link>}
        />
      </Shell>
    );
  }

  const many = tickets.length > 1;
  return (
    <Shell title={many ? "You're all in!" : "You're in!"}>
      <div className="flex flex-col justify-between gap-5 rounded-[2rem] bg-white p-6 ring-1 ring-ink/10 md:flex-row md:items-center sm:p-8 print:hidden">
        <div className="min-w-0">
          <p className="font-semibold">
            {tier.name} × {order.units} · {order.amount_kobo === 0 ? "Free" : formatNaira(order.amount_kobo)}
          </p>
          <p className="mt-1 text-sm break-words text-ink/60">
            {many ? "Tickets" : "Ticket"} sent to {order.buyer_email}. Order {order.reference}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={calendarUrl()} target="_blank" rel="noopener noreferrer" className={`${btn} bg-ink text-white hover:bg-g-blue`}>
            <CalendarPlus aria-hidden className="size-4" /> Add to calendar
          </a>
          <a
            href={`/api/tickets/order/${encodeURIComponent(order.reference)}/pdf`}
            download
            className={`${btn} bg-h-yellow text-ink ring-2 ring-ink hover:bg-p-yellow`}
          >
            <Download aria-hidden className="size-4" /> Download PDF
          </a>
        </div>
      </div>
      <div className="mt-6 grid gap-6">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-ink/60 print:hidden">
        Show your QR code at the entrance. Each code admits one person.
      </p>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="print:hidden">
        <Nav />
      </div>
      <main className="min-h-svh bg-paper pb-24">
        <div className="relative isolate overflow-hidden bg-ink pt-32 pb-28 text-white sm:pt-36 print:hidden">
          <PhotoBackdrop src={gallery.audience} priority position="center 40%" />
          <div className="mx-auto max-w-5xl px-4 sm:px-8">
            <h1 className="type-condensed text-[clamp(3.5rem,9vw,7rem)]">{title}</h1>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:px-8 print:mt-0">{children}</div>
      </main>
    </>
  );
}

function Notice({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-ink/10 sm:p-10">
      <CircleAlert aria-hidden className="mx-auto size-10 text-g-red" />
      <h2 className="type-heading mt-4 text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-ink/70">{body}</p>
      {action}
    </div>
  );
}

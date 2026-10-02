/* eslint-disable @next/next/no-img-element -- the QR is a small generated PNG; next/image adds nothing here */
import { event } from "@/data/devfest26";
import type { Ticket } from "@/lib/tickets/orders";
import { tiers } from "@/lib/tickets/tiers";

const accent = {
  regular: { band: "bg-g-green", chip: "bg-p-green" },
  vip: { band: "bg-g-blue", chip: "bg-p-blue" },
  padi: { band: "bg-g-yellow", chip: "bg-p-yellow" },
} as const;

/** A single ticket stub: details on the left, QR on the right, perforated divider. */
export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const a = accent[ticket.tier];
  return (
    <article className="ticket relative overflow-hidden rounded-[1.75rem] bg-white text-ink ring-1 ring-ink/10 print:break-inside-avoid print:shadow-none">
      <div className={`h-2 ${a.band}`} />
      <div className="grid sm:grid-cols-[1fr_auto]">
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold" style={{ fontVariationSettings: '"ROND" 100' }}>
              <span className="text-g-blue">{"{"}</span> DevFest <span className="text-g-yellow">{"}"}</span>
            </span>
            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase ${a.chip}`}>
              {tiers[ticket.tier].name}
            </span>
          </div>
          <p className="type-heading mt-5 text-2xl sm:text-3xl">{ticket.holder_name}</p>
          <p className="mt-1 text-sm break-all text-ink/60">{ticket.holder_email}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-mono text-[11px] tracking-widest text-ink/50 uppercase">Date</dt>
              <dd className="mt-1 font-semibold">{event.dateLabel}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-widest text-ink/50 uppercase">Venue</dt>
              <dd className="mt-1 font-semibold">
                {event.venue}, {event.city}
              </dd>
            </div>
          </dl>
        </div>

        {/* Perforation + QR */}
        <div className="relative flex flex-col items-center justify-center gap-3 border-t-2 border-dashed border-ink/15 p-6 sm:border-t-0 sm:border-l-2 sm:p-7">
          <span aria-hidden className="absolute -top-3 -left-3 hidden size-6 rounded-full bg-paper sm:block" />
          <span aria-hidden className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-paper sm:block" />
          <img
            src={`/api/tickets/${encodeURIComponent(ticket.code)}/qr`}
            alt={`QR code for ticket ${ticket.code}`}
            width={160}
            height={160}
            className="size-40 rounded-lg"
          />
          <p className="font-mono text-lg font-bold tracking-[0.2em]">{ticket.code}</p>
        </div>
      </div>
    </article>
  );
}

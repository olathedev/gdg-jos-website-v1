/* eslint-disable @next/next/no-img-element -- small generated QR / logo PNGs; next/image adds nothing here */
import { event } from "@/data/devfest26";
import type { Ticket } from "@/lib/tickets/orders";
import { tierColor, tiers } from "@/lib/tickets/tiers";

const venueLine = [event.venue, event.address, event.city].filter(Boolean).join(", ");

/**
 * VIP / My Padi: the designer's ticket artwork rendered server-side with the
 * holder's name, email and QR. Regular (legacy free tickets) keeps the HTML layout.
 */
export default function TicketCard({ ticket }: { ticket: Ticket }) {
  if (ticket.tier === "regular") return <LegacyTicketCard ticket={ticket} />;
  return (
    <figure className="ticket print:break-inside-avoid">
      <img
        src={`/api/tickets/${encodeURIComponent(ticket.code)}/image`}
        alt={`${tiers[ticket.tier].name} ticket for ${ticket.holder_name}, DevFest Jos 2026, code ${ticket.code}`}
        width={1969}
        height={787}
        className="h-auto w-full rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
      />
      <figcaption className="mt-2 flex justify-between px-1 text-xs text-ink/55">
        <span>{ticket.holder_name}</span>
        <span className="tracking-[0.14em]">{ticket.code}</span>
      </figcaption>
    </figure>
  );
}

function LegacyTicketCard({ ticket }: { ticket: Ticket }) {
  const fill = { backgroundColor: tierColor[ticket.tier] };

  return (
    <article
      className="ticket relative overflow-hidden rounded-[1.75rem] bg-white text-ink ring-2 ring-ink print:break-inside-avoid"
      style={{
        // faint grid, like the printed ticket
        backgroundImage:
          "linear-gradient(rgba(30,30,30,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,30,30,.05) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    >
      <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
        {/* Details */}
        <div className="flex flex-col items-center text-center">
          <p className="text-3xl font-bold tracking-tight sm:text-4xl">DevFest Jos 2026</p>
          <p
            className="mt-3 rounded-2xl px-6 py-1.5 text-3xl font-bold tracking-tight ring-2 ring-ink shadow-[0_6px_0_0_var(--color-ink)] sm:px-10 sm:text-4xl"
            style={fill}
          >
            {tiers[ticket.tier].name} Ticket
          </p>

          <div className="mt-8 w-full px-4 py-5 ring-2 ring-ink sm:py-6" style={fill}>
            <p className="text-sm font-semibold sm:text-base">Name:</p>
            <p className="mt-1 text-3xl leading-tight font-semibold tracking-tight break-words sm:text-4xl">{ticket.holder_name}</p>
            <p className="mt-4 text-sm font-semibold sm:text-base">Email:</p>
            <p className="mt-1 text-lg font-semibold break-all sm:text-xl">{ticket.holder_email}</p>
          </div>

          <div aria-hidden className="mt-5 w-2/3 border-t-2 border-dashed border-ink/80" />

          <dl className="mt-5 text-sm leading-relaxed font-semibold uppercase sm:text-base">
            <div>
              <dt className="inline">Date/Time: </dt>
              <dd className="inline">{event.dateTimeLabel}</dd>
            </div>
            <div>
              <dt className="inline">Venue: </dt>
              <dd className="inline">{venueLine}</dd>
            </div>
          </dl>
        </div>

        {/* QR + logos */}
        <div className="flex flex-col items-center">
          <div className="rounded-[1.75rem] bg-white p-3 ring-[3px] ring-ink sm:p-4">
            <img
              src={`/api/tickets/${encodeURIComponent(ticket.code)}/qr`}
              alt={`QR code for ticket ${ticket.code}`}
              width={220}
              height={220}
              className="size-48 sm:size-56"
            />
          </div>
          <p className="mt-3 text-sm font-bold tracking-[0.14em]">{ticket.code}</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <img src="/images/gdglogo.png" alt="" width={46} height={22} className="h-5 w-auto" />
              <span className="text-[9px] leading-[1.1] font-medium">
                Google
                <br />
                Developer
                <br />
                Group Jos
              </span>
            </span>
            <span className="flex items-center text-lg leading-none font-bold" style={{ fontVariationSettings: '"ROND" 100' }}>
              <span className="text-g-blue">{"{"}</span>
              <span className="flex flex-col items-center px-0.5">
                DevFest
                <span className="mt-0.5 rounded-full px-2 text-[8px] ring-1 ring-ink">Jos</span>
              </span>
              <span className="text-g-yellow">{"}"}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

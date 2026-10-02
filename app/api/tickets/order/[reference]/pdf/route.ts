import { getOrder } from "@/lib/tickets/orders";
import { renderTicketsPdf } from "@/lib/tickets/pdf";

export const runtime = "nodejs";

/** Downloads every ticket in an order as a PDF (one ticket per page). */
export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!/^DFJ26-[A-Z0-9-]{8,40}$/.test(reference)) return new Response("Not found", { status: 404 });

  const data = await getOrder(reference);
  if (!data || (data.order.status !== "paid" && data.order.status !== "free") || data.tickets.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await renderTicketsPdf(data.tickets);
  const filename = data.tickets.length > 1 ? `DevFest-Jos-2026-tickets-${reference}.pdf` : `DevFest-Jos-2026-ticket-${data.tickets[0].code}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { getTicket } from "@/lib/tickets/orders";
import { renderTicketPng } from "@/lib/tickets/ticket-image";

export const runtime = "nodejs";

/** Full ticket artwork (template + name, email, QR) as a PNG. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(code)) return new Response("Not found", { status: 404 });
  const ticket = await getTicket(code);
  if (!ticket) return new Response("Not found", { status: 404 });
  const png = await renderTicketPng(ticket);
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}

import QRCode from "qrcode";
import { getTicket } from "@/lib/tickets/orders";

export const runtime = "nodejs";

/** PNG QR code for a ticket (used by the ticket page and emails). */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(code) || !(await getTicket(code))) {
    return new Response("Not found", { status: 404 });
  }
  const png = await QRCode.toBuffer(`DFJ26:${code}`, {
    width: 480,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1e1e1e", light: "#ffffff" },
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

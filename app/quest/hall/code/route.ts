import QRCode from "qrcode";
import { currentEntranceCode, hallKeyValid } from "@/lib/quest/entrance";
import { siteUrl } from "@/lib/tickets/site";

export const dynamic = "force-dynamic";

/** The current entrance QR as SVG, for the hall screen to poll. */
export async function GET(req: Request) {
  if (!hallKeyValid(new URL(req.url).searchParams.get("key"))) return new Response("Not found", { status: 404 });
  const { code, msLeft } = currentEntranceCode();
  const svg = await QRCode.toString(`${siteUrl(req)}/quest/checkin?c=${code}`, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1e1e1e", light: "#ffffff" },
  });
  return Response.json({ svg, msLeft }, { headers: { "Cache-Control": "no-store" } });
}

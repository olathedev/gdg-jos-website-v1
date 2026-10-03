import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import type { Ticket } from "./orders";
import type { TierId } from "./tiers";

// The ticket artwork is the designer's template (1969×787). We only stamp the
// holder's name, email and their QR code into the blank areas.
const W = 1969;
const H = 787;
const BOX = { left: 121, top: 307, width: 1116, height: 264 }; // inside the Name/Email box border
const QR = { left: 1390, top: 126, size: 473 }; // inside the rounded QR frame, clear of its corners

/** Tiers that have a designed template. Regular registration happens off-site. */
export const templatedTiers: TierId[] = ["vip", "padi"];

const asset = (...p: string[]) => path.join(process.cwd(), ...p);

let fonts: Promise<{ name: string; data: Buffer; weight: 700; style: "normal" }[]> | null = null;
const loadFonts = () =>
  (fonts ??= // Latin subset without GSUB: Satori cannot parse the full font's substitution tables.
    readFile(asset("lib/tickets/templates/GoogleSans-Bold-ticket.ttf")).then((data) => [
    { name: "Google Sans", data, weight: 700 as const, style: "normal" as const },
  ]));

const templates = new Map<string, Promise<string>>();
const loadTemplate = (tier: TierId) => {
  if (!templates.has(tier)) {
    templates.set(
      tier,
      readFile(asset(`lib/tickets/templates/${tier}.png`)).then((b) => `data:image/png;base64,${b.toString("base64")}`),
    );
  }
  return templates.get(tier)!;
};

/** Shrink long names so they always fit on one line inside the box. */
function nameSize(name: string) {
  const len = name.length;
  if (len <= 18) return 68;
  if (len <= 24) return 58;
  if (len <= 30) return 48;
  return 40;
}

export async function renderTicketImage(ticket: Ticket) {
  const tier = templatedTiers.includes(ticket.tier) ? ticket.tier : "vip";
  const [bg, qr, fontData] = await Promise.all([
    loadTemplate(tier),
    QRCode.toDataURL(`DFJ26:${ticket.code}`, { width: QR.size, margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }),
    loadFonts(),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", fontFamily: "Google Sans", color: "#1e1e1e" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={bg} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} />

        {/* Name (under the template's "Name:" label) */}
        <div
          style={{
            position: "absolute",
            left: BOX.left,
            width: BOX.width,
            top: 362,
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: nameSize(ticket.holder_name),
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          {ticket.holder_name}
        </div>

        {/* Email (under the template's "Email:" label) */}
        <div
          style={{
            position: "absolute",
            left: BOX.left,
            width: BOX.width,
            top: 506,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ticket.holder_email.length > 34 ? 30 : 36,
            fontWeight: 700,
          }}
        >
          {ticket.holder_email}
        </div>

        {/* QR: white plate covers the sample code in the template */}
        <div style={{ position: "absolute", left: QR.left, top: QR.top, width: QR.size, height: QR.size, background: "#ffffff", display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={qr} width={QR.size} height={QR.size} />
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fontData },
  );
}

export async function renderTicketPng(ticket: Ticket) {
  return Buffer.from(await (await renderTicketImage(ticket)).arrayBuffer());
}

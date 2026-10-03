import "server-only";
import path from "node:path";
import { Document, Font, Image, Line, Page, Svg, Text, View, renderToBuffer, StyleSheet } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { event } from "@/data/devfest26";
import type { Ticket } from "./orders";
import { renderTicketPng } from "./ticket-image";
import { tierColor, tiers } from "./tiers";

const asset = (...p: string[]) => path.join(process.cwd(), ...p);

Font.register({
  family: "Google Sans",
  fonts: [
    { src: asset("lib/tickets/pdf-fonts/GoogleSans-400.ttf"), fontWeight: 400 },
    { src: asset("lib/tickets/pdf-fonts/GoogleSans-700.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((word) => [word]); // never hyphenate names

const INK = "#1e1e1e";
// Ticket-shaped page (same ~2.5:1 ratio as the ticket guide).
const W = 842;
const H = 336;
const GRID = 28;

const s = StyleSheet.create({
  page: { fontFamily: "Google Sans", color: INK, backgroundColor: "#ffffff", flexDirection: "row", padding: 26 },
  left: { flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 24 },
  title: { fontSize: 26, fontWeight: 700 },
  pillWrap: { marginTop: 8, position: "relative" },
  pillShadow: { position: "absolute", left: 0, right: 0, top: 4, bottom: -4, backgroundColor: INK, borderRadius: 12 },
  pill: { borderWidth: 2, borderColor: INK, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 24 },
  pillText: { fontSize: 24, fontWeight: 700 },
  box: { marginTop: 16, width: "100%", borderWidth: 2, borderColor: INK, paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" },
  label: { fontSize: 10, fontWeight: 700 },
  name: { fontSize: 24, fontWeight: 700, marginTop: 2, textAlign: "center" },
  email: { fontSize: 13, fontWeight: 700, marginTop: 2, textAlign: "center" },
  dashed: { marginTop: 12, width: "60%", borderTopWidth: 1.5, borderTopColor: INK, borderStyle: "dashed" },
  meta: { marginTop: 8, maxWidth: 420, fontSize: 9.5, fontWeight: 700, textAlign: "center", textTransform: "uppercase", lineHeight: 1.45 },
  right: { width: 230, alignItems: "center", justifyContent: "center" },
  qrBox: { borderWidth: 3, borderColor: INK, borderRadius: 22, padding: 10, backgroundColor: "#ffffff" },
  code: { marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: 3 },
  logos: { marginTop: 10, flexDirection: "row", alignItems: "center" },
  gdgText: { fontSize: 6.5, lineHeight: 1.15, marginLeft: 4, marginRight: 14 },
  devfest: { fontSize: 15, fontWeight: 700 },
});

function GridBackground() {
  const v = Array.from({ length: Math.ceil(W / GRID) }, (_, i) => i * GRID);
  const h = Array.from({ length: Math.ceil(H / GRID) }, (_, i) => i * GRID);
  return (
    <Svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }} fixed>
      {v.map((x) => (
        <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#ececec" strokeWidth={0.75} />
      ))}
      {h.map((y) => (
        <Line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#ececec" strokeWidth={0.75} />
      ))}
    </Svg>
  );
}

function TicketPage({ ticket, qr }: { ticket: Ticket; qr: string }) {
  const fill = tierColor[ticket.tier];
  const venue = [event.venue, event.address, event.city].filter(Boolean).join(", ");
  return (
    <Page size={[W, H]} style={s.page}>
      <GridBackground />
      <View style={s.left}>
        <Text style={s.title}>DevFest Jos 2026</Text>
        <View style={s.pillWrap}>
          <View style={s.pillShadow} />
          <View style={[s.pill, { backgroundColor: fill }]}>
            <Text style={s.pillText}>{tiers[ticket.tier].name} Ticket</Text>
          </View>
        </View>
        <View style={[s.box, { backgroundColor: fill }]}>
          <Text style={s.label}>Name:</Text>
          <Text style={s.name}>{ticket.holder_name}</Text>
          <Text style={[s.label, { marginTop: 8 }]}>Email:</Text>
          <Text style={s.email}>{ticket.holder_email}</Text>
        </View>
        <View style={s.dashed} />
        <Text style={s.meta}>
          Date/Time: {event.dateTimeLabel}
          {"\n"}Venue: {venue}
        </Text>
      </View>

      <View style={s.right}>
        <View style={s.qrBox}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
          <Image src={qr} style={{ width: 170, height: 170 }} />
        </View>
        <Text style={s.code}>{ticket.code}</Text>
        <View style={s.logos}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={asset("public/images/gdglogo.png")} style={{ width: 28, height: 14 }} />
          <Text style={s.gdgText}>Google{"\n"}Developer{"\n"}Group Jos</Text>
          <Text style={s.devfest}>
            <Text style={{ color: "#4285f4" }}>{"{"}</Text>DevFest<Text style={{ color: "#f9ab00" }}>{"}"}</Text>
          </Text>
        </View>
      </View>
    </Page>
  );
}

/** Designed ticket artwork as a full-bleed page (same aspect ratio as the template). */
function ImagePage({ png }: { png: Buffer }) {
  return (
    <Page size={[W, (W * 787) / 1969]} style={{ padding: 0 }}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
      <Image src={png} style={{ width: "100%", height: "100%" }} />
    </Page>
  );
}

/** One ticket per page, ready to download. */
export async function renderTicketsPdf(tickets: Ticket[]) {
  const pages = await Promise.all(
    tickets.map(async (t) =>
      t.tier === "regular"
        ? { t, qr: await QRCode.toDataURL(`DFJ26:${t.code}`, { width: 480, margin: 1, errorCorrectionLevel: "M", color: { dark: INK, light: "#ffffff" } }) }
        : { t, png: await renderTicketPng(t) },
    ),
  );
  return renderToBuffer(
    <Document title="DevFest Jos 2026 tickets" author="GDG Jos" creator="DevFest Jos 2026">
      {pages.map((p) => ("png" in p && p.png ? <ImagePage key={p.t.id} png={p.png} /> : <TicketPage key={p.t.id} ticket={p.t} qr={(p as { qr: string }).qr} />))}
    </Document>,
  );
}

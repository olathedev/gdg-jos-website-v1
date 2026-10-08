import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { event } from "@/data/devfest26";

// Shared 1200×630 DevFest-themed social card (Open Graph / Twitter).
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const INK = "#1e1e1e";
const file = (...p: string[]) => readFile(path.join(process.cwd(), ...p));

// Artwork cut from the DP flier (public/dp/template.png) with transparent backgrounds.
const flierParts = ["lockup", "rock", "star", "dots", "hearts", "arrow", "ticket", "socials"] as const;
type FlierPart = (typeof flierParts)[number];

let assets: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[]; art: Record<FlierPart, string> }> | null = null;
// Google Sans and Clash have no ₦ glyph; a 1-glyph Noto Sans subset (OFL) fills the gap.
const loadAssets = () =>
  (assets ??= Promise.all([
    file("lib/og/ClashDisplay-600.ttf"),
    file("lib/og/GoogleSans-400.ttf"),
    file("lib/og/GoogleSans-700.ttf"),
    file("lib/og/NotoSans-700-naira.ttf"),
    Promise.all(flierParts.map((n) => file("lib/og/flier", `${n}.png`))),
  ]).then(([clash, sans, sansBold, naira, parts]) => ({
    fonts: [
      { name: "Clash", data: clash, weight: 600, style: "normal" },
      { name: "Sans", data: sans, weight: 400, style: "normal" },
      { name: "Sans", data: sansBold, weight: 700, style: "normal" },
      { name: "Naira", data: naira, weight: 700, style: "normal" },
    ],
    art: Object.fromEntries(flierParts.map((n, i) => [n, `data:image/png;base64,${parts[i].toString("base64")}`])) as Record<FlierPart, string>,
  })));

/** Rotated, ink-outlined pill, like the flier's labels. */
export function Pill({ label, bg, color = INK, x, y, rotate }: { label: string; bg: string; color?: string; x: number; y: number; rotate: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        padding: "12px 24px",
        borderRadius: 999,
        border: `3px solid ${INK}`,
        background: bg,
        color,
        fontFamily: "Sans",
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 1,
        textTransform: "uppercase",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {label}
    </div>
  );
}

// Flier artwork is drawn at this scale so the rock's footer strip lines up with the card's footer band.
const S = 0.8;
const BAND = Math.round(89 * S); // the flier's footer: 5px ink rule + 84px green

/** A piece of flier artwork, absolutely positioned. */
function Art({ src, w, h, x, y, flip }: { src: string; w: number; h: number; x: number; y: number; flip?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      src={src}
      width={Math.round(w * S)}
      height={Math.round(h * S)}
      style={{ position: "absolute", left: x, top: y, width: Math.round(w * S), height: Math.round(h * S), ...(flip && { transform: "scaleX(-1)" }) }}
    />
  );
}

export async function ogCard({ eyebrow, title, subtitle, art }: { eyebrow?: string; title: ReactNode; subtitle?: string; art?: ReactNode }) {
  const { fonts, art: a } = await loadAssets();
  const meta = `${event.dateLabel} · ${event.venue}, ${event.city}`;
  const { width: W, height: H } = ogSize;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#f3fcfe",
          color: INK,
          fontFamily: "Sans",
          // the flier's faint grid
          backgroundImage: "linear-gradient(#eaf3f4 3px, transparent 3px), linear-gradient(90deg, #eaf3f4 3px, transparent 3px)",
          backgroundSize: "74px 74px",
          backgroundPosition: "-14px -14px",
        }}
      >
        {/* Footer band, as on the flier */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: W,
            height: BAND,
            display: "flex",
            alignItems: "center",
            gap: 28,
            paddingLeft: 56,
            background: "#ccf6cf",
            borderTop: `4px solid ${INK}`,
          }}
        >
          <Art src={a.socials} w={235} h={50} x={56} y={(BAND - 4 - 50 * S) / 2} />
          <div style={{ position: "absolute", left: 56 + 235 * S + 24, top: 14, width: 3, height: BAND - 32, background: INK }} />
          <Art src={a.ticket} w={330} h={58} x={56 + 235 * S + 50} y={(BAND - 4 - 58 * S) / 2} />
        </div>

        {/* Doodles; the rock is flipped so its cut edge sits on the card's right edge */}
        <Art src={a.rock} w={290} h={265} x={W - 290 * S} y={H - 265 * S} flip />
        <Art src={a.star} w={57} h={57} x={526} y={52} />
        <Art src={a.dots} w={54} h={120} x={600} y={140} />
        <Art src={a.hearts} w={86} h={84} x={W - 330} y={H - BAND - 96} />

        {art}

        <div style={{ display: "flex", flexDirection: "column", padding: "40px 0 0 56px", width: 800 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={a.lockup} width={451} height={189} style={{ width: 451, height: 189 }} />

          {eyebrow && (
            <div style={{ display: "flex", marginTop: 26 }}>
              <div style={{ display: "flex", background: "#ffe7a5", border: `3px solid ${INK}`, borderRadius: 999, padding: "4px 20px", fontSize: 22, fontWeight: 700 }}>
                {eyebrow}
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Clash", fontWeight: 600, fontSize: 60, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 14 }}>
            {title}
          </div>
          {subtitle && <div style={{ display: "flex", fontSize: 25, color: "rgba(30,30,30,0.75)", marginTop: 12 }}>{subtitle}</div>}
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, marginTop: 10 }}>{meta}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}

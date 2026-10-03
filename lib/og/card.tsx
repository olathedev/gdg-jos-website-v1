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

let assets: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[]; divider: string }> | null = null;
// Google Sans and Clash have no ₦ glyph; a 1-glyph Noto Sans subset (OFL) fills the gap.
const loadAssets = () =>
  (assets ??= Promise.all([
    file("lib/og/ClashDisplay-600.ttf"),
    file("lib/og/GoogleSans-400.ttf"),
    file("lib/og/GoogleSans-700.ttf"),
    file("public/divider.svg"),
    file("lib/og/NotoSans-700-naira.ttf"),
  ]).then(([clash, sans, sansBold, divider, naira]) => ({
    fonts: [
      { name: "Clash", data: clash, weight: 600, style: "normal" },
      { name: "Sans", data: sans, weight: 400, style: "normal" },
      { name: "Sans", data: sansBold, weight: 700, style: "normal" },
      { name: "Naira", data: naira, weight: 700, style: "normal" },
    ],
    divider: `data:image/svg+xml;base64,${divider.toString("base64")}`,
  })));

/** Rotated Google-colour pill, like the hero's falling pills. */
export function Pill({ label, bg, color = INK, x, y, rotate }: { label: string; bg: string; color?: string; x: number; y: number; rotate: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        padding: "14px 26px",
        borderRadius: 999,
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

export async function ogCard({ eyebrow, title, subtitle, art }: { eyebrow?: string; title: ReactNode; subtitle?: string; art?: ReactNode }) {
  const { fonts, divider } = await loadAssets();
  const meta = `${event.dateLabel} · ${event.venue}, ${event.city}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: INK,
          color: "#ffffff",
          fontFamily: "Sans",
          // faint grid, as on the printed tickets
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        {art}

        <div style={{ display: "flex", flexDirection: "column", padding: "56px 64px 0", flex: 1 }}>
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", fontWeight: 700, fontSize: 36 }}>
              <span style={{ color: "#4285f4" }}>{"{"}</span>
              <span style={{ padding: "0 4px" }}>DevFest</span>
              <span style={{ color: "#f9ab00" }}>{"}"}</span>
            </div>
            <div style={{ display: "flex", background: "#ffffff", color: INK, borderRadius: 999, padding: "4px 14px", fontSize: 20, fontWeight: 700 }}>JOS &apos;26</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: 40, maxWidth: 760 }}>
            {eyebrow && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#4285f4", "#ea4335", "#f9ab00", "#34a853"].map((c) => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: 99, background: c }} />
                  ))}
                </div>
                {eyebrow}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Clash", fontWeight: 600, fontSize: 84, lineHeight: 1.02, letterSpacing: -2, marginTop: 18 }}>
              {title}
            </div>
            {subtitle && <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.75)", marginTop: 18 }}>{subtitle}</div>}
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 22 }}>{meta}</div>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={divider} width={1200} height={68} style={{ display: "flex", width: 1200, height: 68 }} />
      </div>
    ),
    { ...ogSize, fonts },
  );
}

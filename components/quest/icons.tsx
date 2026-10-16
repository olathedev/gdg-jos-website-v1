import type { SVGProps } from "react";
import type { StageId } from "@/lib/quest/config";

// DevFest-style drawn icons: ink lines on flat Google-colour shapes. No emoji anywhere.

const INK = "#0A0A0A";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, p: IconProps) => ({
  width: size,
  height: size,
  "aria-hidden": true as const,
  focusable: false as const,
  ...p,
});

/* ---------- stage marks ---------- */

/** Stage glyphs on a 48 grid. `ink` draws the lines; `fill` paints the flat shapes. */
export function StageGlyph({ id, size = 40, ink = INK, fill = "#fff", ...p }: IconProps & { id: StageId; ink?: string; fill?: string }) {
  const s = { stroke: ink, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" fill="none" {...base(size, p)}>
      {id === "socials" && (
        <>
          <circle cx="24" cy="24" r="5.5" fill={fill} {...s} />
          <path d="M15.5 15.5a12 12 0 0 0 0 17M32.5 15.5a12 12 0 0 1 0 17" {...s} />
          <path d="M9.5 9.5a20.5 20.5 0 0 0 0 29M38.5 9.5a20.5 20.5 0 0 1 0 29" {...s} />
        </>
      )}
      {id === "squad" && (
        <>
          <circle cx="16" cy="17" r="6" fill={fill} {...s} />
          <circle cx="32" cy="17" r="6" fill={fill} {...s} />
          <path d="M5 39c0-6.6 4.9-11 11-11s11 4.4 11 11" fill={fill} {...s} />
          <path d="M21 39c0-6.6 4.9-11 11-11s11 4.4 11 11" fill={fill} {...s} />
        </>
      )}
      {id === "quiz" && <path d="M27.5 4 10 27.5h12L19 44l19-25.5H26L27.5 4Z" fill={fill} {...s} />}
      {id === "partners" && (
        <>
          <path d="M12 5v38" {...s} />
          <path d="M12 8h25l-6 8 6 8H12" fill={fill} {...s} />
          <circle cx="12" cy="43" r="1.5" fill={ink} />
        </>
      )}
    </svg>
  );
}

/** The stage's DevFest shape: circle, squircle, hexagon, pill. */
export const STAGE_SHAPE: Record<StageId, string> = {
  socials: "50%",
  squad: "30%",
  quiz: "0",
  partners: "999px",
};
export const HEX = "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

/** A stage's mark: its glyph on its DevFest shape, or a dashed outline when locked. */
export function StageBadge({ id, color, size = 88, locked = false }: { id: StageId; color: string; size?: number; locked?: boolean }) {
  const radius = STAGE_SHAPE[id];
  const hex = id === "quiz";
  const w = id === "partners" ? size * 1.25 : size;
  if (locked) {
    return (
      <span
        className="relative flex items-center justify-center"
        style={{ width: w, height: size }}
      >
        <svg aria-hidden className="absolute inset-0" width={w} height={size} viewBox={`0 0 ${w} ${size}`} fill="none">
          {hex ? (
            <path
              d={`M${w / 2} 2 ${w * 0.93 - 1} ${size * 0.25} ${w * 0.93 - 1} ${size * 0.75} ${w / 2} ${size - 2} ${w * 0.07 + 1} ${size * 0.75} ${w * 0.07 + 1} ${size * 0.25}Z`}
              stroke="rgb(255 255 255 / 0.22)"
              strokeWidth="2"
              strokeDasharray="5 6"
            />
          ) : (
            <rect
              x="1.5"
              y="1.5"
              width={w - 3}
              height={size - 3}
              rx={radius === "50%" ? size / 2 : radius === "30%" ? size * 0.3 : size / 2}
              stroke="rgb(255 255 255 / 0.22)"
              strokeWidth="2"
              strokeDasharray="5 6"
            />
          )}
        </svg>
        <StageGlyph id={id} size={size * 0.46} ink="rgb(255 255 255 / 0.28)" fill="transparent" />
      </span>
    );
  }
  return (
    <span
      className="flex items-center justify-center"
      style={{ width: w, height: size, background: color, borderRadius: hex ? 0 : radius, clipPath: hex ? HEX : undefined }}
    >
      <StageGlyph id={id} size={size * 0.5} />
    </span>
  );
}

/* ---------- small UI icons ---------- */

/** DevFest spark, used for points. */
export function Spark({ size = 16, color = "#F9AB00", ...p }: IconProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, p)}>
      <path d="M12 1.5c.9 6.4 4.1 9.6 10.5 10.5-6.4.9-9.6 4.1-10.5 10.5-.9-6.4-4.1-9.6-10.5-10.5C7.9 11.1 11.1 7.9 12 1.5Z" fill={color} />
    </svg>
  );
}

export function LockGlyph({ size = 16, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export function MapGlyph({ size = 24, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)}>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.5" strokeDasharray="0.1 3.4" />
    </svg>
  );
}

export function PodiumGlyph({ size = 24, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)}>
      <path d="M9 20V9h6v11M3 20v-6h6M15 20v-8h6v8M2 20h20" />
      <path d="m12 3 .9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 5.1l2-.3L12 3Z" fill="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function QrGlyph({ size = 24, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...base(size, p)}>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
      <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 19h1M19.5 14v1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Rank badge for podiums and round boards. */
export function RankBadge({ rank, size = 28 }: { rank: number; size?: number }) {
  const bg = rank === 1 ? "#F9AB00" : rank === 2 ? "#BDC1C6" : rank === 3 ? "#E8A87C" : "transparent";
  return (
    <span
      className={`type-heading inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums ${rank <= 3 ? "text-[#0A0A0A]" : "text-white/50"}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.46 }}
    >
      {rank}
    </span>
  );
}

/* ---------- brand marks ---------- */

export function BrandMark({ id, size = 26 }: { id: string; size?: number }) {
  const p = base(size, {});
  if (id === "x")
    return (
      <svg viewBox="0 0 24 24" {...p}>
        <path
          fill="currentColor"
          d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z"
        />
      </svg>
    );
  if (id === "instagram")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (id === "linkedin")
    return (
      <svg viewBox="0 0 24 24" {...p}>
        <path
          fill="currentColor"
          d="M5.4 8.6h3v10.6h-3V8.6Zm1.5-4.9a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5ZM10.3 8.6h2.9v1.45h.04c.4-.76 1.38-1.56 2.85-1.56 3.04 0 3.6 2 3.6 4.6v6.1h-3v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.86v5.5h-3V8.6Z"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        fill="currentColor"
        d="M13.4 21.5v-7.7h2.6l.4-3h-3V8.9c0-.87.25-1.46 1.5-1.46h1.6V4.76c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.87 1.4-3.87 3.97v2.2H7.7v3h2.6v7.7h3.1Z"
      />
    </svg>
  );
}

/* ---------- avatars ---------- */

export type AvatarSpec = { bg: string; head: "round" | "square" | "hex" | "dome"; eyes: "dots" | "visor" | "code" | "wink"; accent: string };

/** Geometric DevFest characters: a head shape with code-style eyes on a Google colour. */
export function AvatarArt({ spec, size = 48 }: { spec: AvatarSpec; size?: number }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 64 64" {...base(size, {})}>
      <circle cx="32" cy="32" r="32" fill={spec.bg} />
      {spec.head === "dome" && (
        <>
          <path d="M32 13v-4" {...s} strokeWidth={2.5} />
          <circle cx="32" cy="8" r="3" fill={spec.accent} stroke={INK} strokeWidth={2} />
        </>
      )}
      {spec.head === "round" && <circle cx="32" cy="35" r="19" fill="#fff" {...s} />}
      {spec.head === "square" && <rect x="13" y="16" width="38" height="38" rx="11" fill="#fff" {...s} />}
      {spec.head === "hex" && <path d="M32 13 50.5 23.5v21L32 55 13.5 44.5v-21L32 13Z" fill="#fff" {...s} />}
      {spec.head === "dome" && <path d="M13 50V35a19 19 0 0 1 38 0v15a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3Z" fill="#fff" {...s} />}
      {spec.eyes === "dots" && (
        <>
          <circle cx="25" cy="35" r="3.4" fill={INK} />
          <circle cx="39" cy="35" r="3.4" fill={INK} />
        </>
      )}
      {spec.eyes === "visor" && <rect x="19" y="30" width="26" height="9" rx="4.5" fill={INK} />}
      {spec.eyes === "visor" && <rect x="23" y="32.5" width="7" height="4" rx="2" fill={spec.accent} />}
      {spec.eyes === "code" && <path d="m27 30-5 5 5 5M37 30l5 5-5 5" fill="none" {...s} />}
      {spec.eyes === "wink" && (
        <>
          <circle cx="25" cy="35" r="3.4" fill={INK} />
          <path d="M35.5 35h7" fill="none" {...s} />
        </>
      )}
      {spec.eyes !== "visor" && <path d="M28 44c2.4 1.6 5.6 1.6 8 0" fill="none" {...s} strokeWidth={2.5} />}
      <circle cx={spec.head === "hex" ? 19.5 : 18} cy="41" r="2.4" fill={spec.accent} opacity={spec.eyes === "wink" ? 1 : 0} />
    </svg>
  );
}

export function ScanGlyph({ size = 24, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)}>
      <path d="M3.5 8V6a2.5 2.5 0 0 1 2.5-2.5h2M16 3.5h2A2.5 2.5 0 0 1 20.5 6v2M20.5 16v2a2.5 2.5 0 0 1-2.5 2.5h-2M8 20.5H6A2.5 2.5 0 0 1 3.5 18v-2" />
      <path d="M7.5 12h9" />
    </svg>
  );
}

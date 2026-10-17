import type { ReactNode } from "react";
import { AVATAR_TINTS, avatarFor, STACKS } from "@/lib/quest/config";
import { AvatarArt } from "./icons";

export function Logo({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-lg font-bold">
        <span className="text-g-blue">{"{"}</span>DevFest<span className="text-g-yellow">{"}"}</span>
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}
      >
        JOS &apos;26
      </span>
    </span>
  );
}

export function Dots({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex gap-[3px] ${className}`}>
      <span className="size-1.5 rounded-full bg-g-red" />
      <span className="size-1.5 rounded-full bg-g-yellow" />
      <span className="size-1.5 rounded-full bg-g-green" />
      <span className="size-1.5 rounded-full bg-g-blue" />
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase ${className}`}>
      <Dots />
      {children}
    </p>
  );
}

/** Section label with a coloured dot, used above lists. */
export function SectionLabel({ children, color = "bg-g-blue" }: { children: ReactNode; color?: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-ink/70 uppercase">
      <span aria-hidden className={`size-2 rounded-full ${color}`} />
      {children}
    </h2>
  );
}

export function tintFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

export function Avatar({ id, initials, size = 46, className = "" }: { id: string; initials: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-ink ${className}`}
      style={{ width: size, height: size, background: tintFor(id), fontSize: size * 0.3 }}
    >
      {initials}
    </span>
  );
}

export function StackTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[#D6D6D6] px-2.5 py-0.5 text-[10.5px] font-bold tracking-[0.06em] text-textDark uppercase">
      {label}
    </span>
  );
}

export const stackStyle = (label: string) => STACKS.find((s) => s.label === label) ?? STACKS[0];

/** Blob card with the DevFest asymmetric corner. */
export function Blob({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative overflow-hidden rounded-[24px_64px_24px_24px] ${className}`}>{children}</div>;
}

export function PageTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`type-heading text-[26px] leading-tight font-bold sm:text-[32px] ${className}`}>{children}</h1>;
}

export const pill =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue disabled:opacity-60";
export const pillDark = `${pill} bg-ink text-white hover:bg-ink/85`;
export const pillLight = `${pill} bg-white text-ink hover:bg-white/85`;
export const pillOutline = `${pill} border-2 border-ink text-ink hover:bg-ink/5`;

export const input =
  "h-12 w-full rounded-full border border-[#D6D6D6] bg-fg px-[18px] text-base outline-none focus:border-g-blue focus:ring-2 focus:ring-g-blue/25";

/* ---------- stage game (dark) ---------- */

/** Preset avatar: a geometric DevFest character. Falls back to initials. */
export function GameAvatar({
  avatar,
  initials = "?",
  size = 48,
  className = "",
}: {
  avatar: string | null | undefined;
  initials?: string;
  size?: number;
  className?: string;
}) {
  const a = avatarFor(avatar);
  return (
    <span aria-hidden className={`inline-flex shrink-0 overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      {a ? (
        <AvatarArt spec={a} size={size} />
      ) : (
        <span className="flex size-full items-center justify-center bg-surface-3 font-bold text-fg" style={{ fontSize: size * 0.34 }}>
          {initials}
        </span>
      )}
    </span>
  );
}

/** Chunky game button with a pressed-down feel. */
export const gameBtn =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-fg px-7 text-base font-bold text-on-fg transition-[transform,background-color] hover:bg-fg/90 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h-yellow";
export const gameBtnGhost =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-fg/20 px-6 text-sm font-bold text-fg transition-colors hover:bg-fg/[0.06] focus-visible:outline-2 focus-visible:outline-fg";
export const panel = "rounded-[24px] border border-fg/[0.08] bg-surface";

"use client";

import { motion as m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

const variants = {
  light: "bg-white text-ink hover:bg-white/85",
  dark: "bg-ink text-white hover:bg-ink/85",
  ghost: "bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm hover:bg-white/15",
  outline: "bg-transparent text-ink ring-1 ring-inset ring-ink/20 hover:bg-ink/5",
  blue: "bg-g-blue text-white hover:bg-g-blue/90",
} as const;

type PillLinkProps = ComponentProps<"a"> & {
  variant?: keyof typeof variants;
  icon?: boolean;
  size?: "md" | "lg";
};

/** Rounded CTA link. External links open in a new tab. */
export function PillLink({
  variant = "light",
  icon = true,
  size = "md",
  className = "",
  children,
  href = "#",
  ...rest
}: PillLinkProps) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className={`group inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-200 ${
        size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-4 text-sm"
      } ${variants[variant]} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue ${className}`}
      {...rest}
    >
      {children}
      {icon && (
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      )}
    </a>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] ${className}`}>
      <GoogleDots />
      {children}
    </p>
  );
}

/** Four Google-colour dots used as a bullet / brand mark. */
export function GoogleDots({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex gap-1 ${className}`}>
      <span className="size-1.5 rounded-full bg-g-blue" />
      <span className="size-1.5 rounded-full bg-g-red" />
      <span className="size-1.5 rounded-full bg-g-yellow" />
      <span className="size-1.5 rounded-full bg-g-green" />
    </span>
  );
}

/** Fades content up as it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** "{ DevFest } Jos 26" wordmark. */
export function Logo({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`text-xl leading-none font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}>
        <span className="text-g-blue">{"{"}</span>
        <span className="px-0.5">DevFest</span>
        <span className="text-g-yellow">{"}"}</span>
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] whitespace-nowrap font-semibold uppercase tracking-wider ${
          tone === "light" ? "bg-white text-ink" : "bg-ink text-white"
        }`}
      >
        Jos &apos;26
      </span>
    </span>
  );
}

/** The DevFest shapes strip (public/divider.svg) used between sections. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-14 w-full bg-[#0a2914] bg-[url(/divider.svg)] bg-center bg-repeat-x [background-size:auto_100%] sm:h-[82px] ${className}`}
    />
  );
}

/* ---------- Brand shapes (decorative) ---------- */

export function Star4({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50 0C53 30 70 47 100 50C70 53 53 70 50 100C47 70 30 53 0 50C30 47 47 30 50 0Z" />
    </svg>
  );
}

export function QuarterCircle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M0 100V0a100 100 0 0 1 100 100Z" />
    </svg>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 60" className={className} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
      <path d="M6 30c12-24 24-24 36 0s24 24 36 0 24-24 36 0" />
    </svg>
  );
}

export function Braces({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 100" className={className} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 8c-14 0-18 6-18 18v10c0 8-4 14-14 14 10 0 14 6 14 14v10c0 12 4 18 18 18" />
      <path d="M82 8c14 0 18 6 18 18v10c0 8 4 14 14 14-10 0-14 6-14 14v10c0 12-4 18-18 18" />
    </svg>
  );
}

export function Ring({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="16">
      <circle cx="50" cy="50" r="40" />
    </svg>
  );
}

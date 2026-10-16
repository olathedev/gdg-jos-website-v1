"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapGlyph, PodiumGlyph, ScanGlyph } from "./icons";

const tabs = [
  { href: "/quest/home", label: "Map", Icon: MapGlyph, also: ["/quest/stage", "/quest/quiz"] },
  { href: "/quest/scan", label: "Scan", Icon: ScanGlyph, also: [] as string[] },
  { href: "/quest/board", label: "Board", Icon: PodiumGlyph, also: [] as string[] },
];

/** Floating capsule: Map, Scan (the white disc) and Board. */
export default function Nav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      <ul className="flex w-full max-w-[340px] items-center rounded-full border border-white/[0.08] bg-[#141414]/95 p-1.5 shadow-[0_12px_40px_rgb(0_0_0/0.6)] backdrop-blur">
        {tabs.map((t) => {
          const on = path === t.href || t.also.some((a) => path.startsWith(a));
          const qr = t.href === "/quest/scan";
          return (
            <li key={t.href} className="flex flex-1 justify-center">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-[52px] items-center justify-center gap-2 rounded-full px-4 text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-h-yellow ${
                  qr
                    ? "size-[52px] bg-white px-0 text-[#0A0A0A] hover:bg-white/90"
                    : on
                      ? "bg-white/[0.09] text-white"
                      : "text-white/45 hover:text-white/80"
                }`}
              >
                <t.Icon size={qr ? 24 : 22} />
                {qr ? <span className="sr-only">{t.label}</span> : on && <span>{t.label}</span>}
                {!qr && !on && <span className="sr-only">{t.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

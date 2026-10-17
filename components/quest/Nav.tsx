"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapGlyph, PodiumGlyph, ScanGlyph, StageGlyph } from "./icons";

const PeopleGlyph = ({ size = 22 }: { size?: number }) => <StageGlyph id="squad" size={size} ink="currentColor" fill="transparent" />;

function PadiGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.6-7.5 10-7.5 10Z" />
    </svg>
  );
}

const tabs = [
  { href: "/quest/home", label: "Map", Icon: MapGlyph, also: ["/quest/stage", "/quest/quiz"] },
  { href: "/quest/people", label: "People", Icon: PeopleGlyph, also: [] as string[] },
  { href: "/quest/scan", label: "Scan", Icon: ScanGlyph, also: [] as string[] },
  { href: "/quest/crew", label: "Padis", Icon: PadiGlyph, also: [] as string[] },
  { href: "/quest/board", label: "Board", Icon: PodiumGlyph, also: [] as string[] },
];

/** Floating capsule: Map, People, Scan (the white disc), Padis and Board. */
export default function Nav({ pending = 0 }: { pending?: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      <ul className="flex w-full max-w-[400px] items-center rounded-full border border-white/[0.08] bg-[#141414] p-1.5 shadow-[0_8px_24px_rgb(0_0_0/0.5)]">
        {tabs.map((t) => {
          const on = path === t.href || t.also.some((a) => path.startsWith(a));
          const scan = t.href === "/quest/scan";
          return (
            <li key={t.href} className="flex flex-1 justify-center">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                aria-label={t.label === "Padis" && pending ? `Padis, ${pending} new requests` : t.label}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-h-yellow ${
                  scan
                    ? "size-[54px] bg-white text-[#0A0A0A] hover:bg-white/90"
                    : on
                      ? "min-h-[52px] w-full text-white"
                      : "min-h-[52px] w-full text-white/45 hover:text-white/80"
                }`}
              >
                <t.Icon size={scan ? 24 : 21} />
                {!scan && <span>{t.label}</span>}
                {!scan && on && <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-h-yellow" />}
                {t.label === "Padis" && pending > 0 && (
                  <span aria-hidden className="absolute top-1.5 right-[22%] size-2.5 rounded-full border-2 border-[#141414] bg-g-red" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

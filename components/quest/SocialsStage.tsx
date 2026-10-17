"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { followAction } from "@/app/quest/actions";
import { FOLLOWS, POINTS } from "@/lib/quest/config";
import { BrandMark } from "./icons";
import { gameBtn } from "./ui";

/** Big tiles: tap opens the page in a new tab and claims the follow. */
export default function SocialsStage({ followed }: { followed: string[] }) {
  const [, start] = useTransition();
  const [done, add] = useOptimistic(followed, (cur, id: string) => [...cur, id]);
  const cleared = FOLLOWS.every((f) => done.includes(f.id));

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-3">
        {FOLLOWS.map((f) => {
          const on = done.includes(f.id);
          return (
            <li key={f.id}>
              <a
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (on) return;
                  start(async () => {
                    add(f.id);
                    await followAction(f.id);
                  });
                }}
                className={`relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[24px] border p-3 text-center transition-transform active:scale-95 ${
                  on ? "border-g-green/70 bg-[#121212]" : "border-white/[0.08] bg-[#121212] hover:border-white/25"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-14 items-center justify-center rounded-full ${on ? "bg-white text-[#0A0A0A]" : "bg-[#1E1E1E] text-white"}`}
                >
                  <BrandMark id={f.id} size={26} />
                </span>
                <span className="text-sm font-bold">{f.name}</span>
                <span className="truncate text-xs text-white/55">{f.handle}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-black ${on ? "bg-g-green text-white" : "bg-h-yellow text-[#0A0A0A]"}`}
                >
                  {on ? (
                    <span className="flex items-center gap-1">
                      <Check aria-hidden className="size-3" strokeWidth={4} /> Done
                    </span>
                  ) : (
                    `+${POINTS.follow}`
                  )}
                </span>
                <span className="sr-only">{on ? "Followed" : "Follow GDG Jos (opens in a new tab)"}</span>
              </a>
            </li>
          );
        })}
      </ul>
      {cleared ? (
        <div className="quest-pop flex flex-col items-center gap-3 rounded-[24px] border border-g-green/40 bg-[#121212] p-5 text-center">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-g-green text-white">
            <Check className="size-6" strokeWidth={3.5} />
          </span>
          <span className="type-heading text-xl font-bold">Stage cleared!</span>
          <span className="text-sm text-white/70">Padi Up is unlocked. Time to meet people.</span>
          <Link href="/quest/stage/padiup" className={gameBtn}>
            Go to Stage 2
          </Link>
        </div>
      ) : (
        <p className="text-center text-xs leading-relaxed text-white/50">
          Tap a tile to follow, then come back. These apps don&apos;t show who follows a page, so winners&apos; follows are
          checked by hand.
        </p>
      )}
    </div>
  );
}

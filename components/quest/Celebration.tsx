"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * "New padi" celebration: a 2.5s Lottie confetti burst plus a message. The player and the
 * animation load only when this mounts. Never blocks: the burst ignores taps, the message can
 * be dismissed, and it all clears itself after about 3 seconds. With reduced motion, the
 * message shows on its own.
 */
export default function Celebration({ message, onDone }: { message: string; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const finished = useRef(onDone);
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    finished.current = onDone;
  });

  useEffect(() => {
    const timer = setTimeout(() => finished.current(), reduced ? 3500 : 3200);
    if (reduced) return () => clearTimeout(timer);
    let anim: { destroy: () => void } | null = null;
    let cancelled = false;
    Promise.all([import("lottie-web/build/player/lottie_light"), import("./padi-celebration.json")])
      .then(([lottie, data]) => {
        if (cancelled || !box.current) return;
        anim = lottie.default.loadAnimation({
          container: box.current,
          renderer: "svg",
          loop: false,
          autoplay: true,
          animationData: data.default,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(timer);
      anim?.destroy();
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center px-4">
      {!reduced && <div ref={box} aria-hidden className="size-[min(80vw,340px)]" />}
      <div
        role="status"
        className="pointer-events-auto fixed inset-x-4 bottom-28 mx-auto flex max-w-sm items-center gap-3 rounded-full border border-g-green/50 bg-[#0F1A12] py-2 pr-2 pl-5 shadow-[0_10px_30px_rgb(0_0_0/0.5)]"
      >
        <span className="flex-1 text-sm font-bold text-[#CCF6C5]">{message}</span>
        <button
          type="button"
          onClick={() => finished.current()}
          aria-label="Dismiss"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}

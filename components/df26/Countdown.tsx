"use client";

import { useEffect, useState } from "react";

const units = [
  ["Days", 86_400_000],
  ["Hours", 3_600_000],
  ["Mins", 60_000],
  ["Secs", 1_000],
] as const;

function split(ms: number) {
  return units.map(([label, size], i) => ({
    label,
    v: Math.floor((i === 0 ? ms : ms % units[i - 1][1]) / size),
  }));
}

/** Ticks down to `to`. Renders nothing until mounted (avoids hydration mismatch) or once the date has passed. */
export default function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const target = new Date(to).getTime();
  if (now === null || Number.isNaN(target) || target <= now) return null;

  return (
    <div role="timer" aria-label="Time until DevFest Jos 2026" className="flex gap-2">
      {split(target - now).map(({ label, v }) => {
        return (
          <div key={label} className="flex w-16 flex-col items-center rounded-2xl bg-white/[0.07] py-2.5 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="type-heading text-2xl tabular-nums">{String(v).padStart(2, "0")}</span>
            <span className="mt-1 text-[10px] font-medium tracking-wider text-white/55 uppercase">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

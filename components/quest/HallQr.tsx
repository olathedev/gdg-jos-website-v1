"use client";

import { useEffect, useState } from "react";

/** Polls the rotating entrance code and swaps the QR just after each change. */
export default function HallQr({ hallKey }: { hallKey: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let alive = true;
    const load = async () => {
      let wait = 5000;
      try {
        const res = await fetch(`/quest/hall/code?key=${encodeURIComponent(hallKey)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { svg: string; msLeft: number };
        if (!alive) return;
        setSvg(data.svg);
        setOffline(false);
        wait = Math.min(data.msLeft + 300, 30_000);
      } catch {
        if (alive) setOffline(true);
      }
      if (alive) timer = setTimeout(load, wait);
    };
    load();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [hallKey]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="img"
        aria-label="Check-in QR code. It changes every 30 seconds."
        className={`aspect-square w-[min(260px,28vw)] [&>svg]:h-full [&>svg]:w-full ${offline ? "opacity-30" : ""}`}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      <span className="rounded-full bg-paper px-3.5 py-1.5 text-sm font-semibold text-textDark">
        {offline ? "Reconnecting…" : "Code changes every 30 seconds"}
      </span>
    </div>
  );
}

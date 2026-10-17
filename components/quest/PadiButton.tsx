"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { connectAction } from "@/app/quest/actions";
import type { ConnState } from "@/lib/quest/game";
import Celebration from "./Celebration";

/** "Be my padi" for a single profile (the shared link page). */
export default function PadiButton({ id, initial, name }: { id: string; initial: ConnState; name: string }) {
  const [state, setState] = useState<ConnState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [party, setParty] = useState(false);

  if (state === "connected") {
    return (
      <>
        {party && <Celebration message={`You and ${name} are now padis!`} onDone={() => setParty(false)} />}
        <Link
          href="/quest/crew"
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-g-green/50 px-6 text-sm font-bold text-[#CCF6C5]"
        >
          <Check aria-hidden className="size-4" strokeWidth={3} /> You&apos;re padis · see socials
        </Link>
      </>
    );
  }
  if (state === "requested") {
    return (
      <span className="flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-bold text-white/60">
        Request sent
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const before = state;
            setState(before === "incoming" ? "connected" : "requested");
            const res = await connectAction(id);
            if (res && !res.ok) {
              setState(before);
              setError(res.message);
            } else if (res?.padi) {
              setState("connected");
              setParty(true);
            }
          })
        }
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-white px-8 text-[15px] font-bold text-[#0A0A0A] transition-transform active:scale-[0.97] disabled:opacity-60"
      >
        {state === "incoming" ? "Accept their padi request" : "Be my padi"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-bold text-[#F8D8D8]">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setListedAction } from "@/app/quest/actions";
import { StageGlyph } from "./icons";

/** The obvious switch: get listed in People in one tap (confirming 18+ if needed). */
export default function ListMeCta({ adult }: { adult: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-h-yellow/40 bg-[#17140A] p-4" aria-labelledby="listme-h">
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-h-yellow text-[#0A0A0A]">
          <StageGlyph id="squad" size={24} ink="currentColor" fill="transparent" />
        </span>
        <div className="flex flex-col">
          <h2 id="listme-h" className="text-[15px] font-bold">
            You&apos;re hidden from People
          </h2>
          <p className="text-[13px] leading-snug text-white/65">Show up so others can find you and send padi requests.</p>
        </div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await setListedAction(true, !adult);
            if (res && !res.ok) return setError(res.message);
            router.refresh();
          })
        }
        className="flex min-h-12 items-center justify-center rounded-full bg-h-yellow text-[15px] font-bold text-[#0A0A0A] transition-transform active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Turning on…" : adult ? "Show me in People" : "I'm 18+ · show me in People"}
      </button>
      {!adult && <p className="text-center text-xs text-white/45">Under 18? You can still scan people and play every stage.</p>}
      {error && (
        <p role="alert" className="text-center text-sm font-bold text-[#F8D8D8]">
          {error}
        </p>
      )}
    </section>
  );
}

"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useActionState } from "react";
import { type Result, xPostAction } from "@/app/quest/actions";
import { HASHTAGS, X_MENTION } from "@/lib/quest/config";
import { gameBtn, gameBtnGhost, panel } from "./ui";

const TEXT = `I'm at DevFest Jos 2026 with ${X_MENTION}, building for the agentic era! ${HASHTAGS.join(" ")}`;
const INTENT = `https://x.com/intent/tweet?text=${encodeURIComponent(TEXT)}`;

const field =
  "h-12 w-full rounded-2xl border border-fg/[0.12] bg-surface px-4 text-base text-fg outline-none placeholder:text-fg/30 focus:border-h-yellow";

function XMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

/** Home: post about DevFest Jos on X, paste the link, get the points. One post per player. */
export default function XPost({ posted, handle, points }: { posted: boolean; handle: string | null; points: number }) {
  const [state, action, pending] = useActionState<Result, FormData>(xPostAction, null);
  const done = posted || state?.ok;

  return (
    <section className={`${panel} flex flex-col gap-4 p-4`} aria-labelledby="xpost-h">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-on-fg">
          <XMark size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 id="xpost-h" className="text-[15px] font-bold">
            Post about DevFest Jos on X
          </h2>
          <span className="text-xs text-fg/60">
            {done ? "Posted. Thanks for spreading the word!" : `+${points} points · one post each`}
          </span>
        </div>
        {done && (
          <span className="flex size-8 items-center justify-center rounded-full bg-g-green text-white">
            <Check aria-hidden className="size-4" strokeWidth={3} />
            <span className="sr-only">Done</span>
          </span>
        )}
      </div>

      {!done && (
        <>
          <a href={INTENT} target="_blank" rel="noopener noreferrer" className={gameBtnGhost}>
            1. Write your post <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">(opens X in a new tab)</span>
          </a>
          <form action={action} className="flex flex-col gap-2">
            <label htmlFor="xpost-url" className="text-xs font-bold text-fg/60">
              2. Paste the link to your post
            </label>
            <input
              id="xpost-url"
              name="url"
              type="url"
              inputMode="url"
              required
              autoComplete="off"
              placeholder={`https://x.com/${handle ?? "you"}/status/…`}
              className={field}
            />
            <button type="submit" disabled={pending} className={`${gameBtn} min-h-12`}>
              {pending ? "Saving…" : `Submit for +${points}`}
            </button>
          </form>
          <p className="text-xs text-fg/50">
            Tag {X_MENTION} and use {HASHTAGS.join(" ")}. Your points land as soon as you submit.
          </p>
        </>
      )}

      {state && !state.ok && (
        <p role="alert" className="rounded-full border border-g-red/40 bg-g-red/10 px-4 py-2.5 text-center text-sm font-bold text-bad">
          {state.message}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-full border border-g-green/40 bg-g-green/10 px-4 py-2.5 text-center text-sm font-bold text-good">
          {state.message}
        </p>
      )}
    </section>
  );
}

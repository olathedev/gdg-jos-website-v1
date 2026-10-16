"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import { lockInAction } from "@/app/quest/actions";
import { POINTS } from "@/lib/quest/config";
import type { SquadQuestion } from "@/lib/quest/stages";
import { GameAvatar, gameBtn, gameBtnGhost } from "./ui";

type Answers = Partial<Record<SquadQuestion["key"], string>>;

export default function SquadQuiz({
  token,
  avatar,
  questions,
  retryIn,
  header,
}: {
  header: ReactNode;
  token: string;
  avatar: string | null;
  questions: SquadQuestion[];
  retryIn: number;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [wait, setWait] = useState(retryIn);
  const [error, setError] = useState<string | null>(null);
  const [won, setWon] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  if (won) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="quest-pop relative">
          <GameAvatar avatar={avatar} size={110} className="ring-4 ring-g-green ring-offset-4 ring-offset-[#0A0A0A]" />
          <span className="absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full border-4 border-[#0A0A0A] bg-g-green text-white">
            <Check aria-hidden className="size-5" strokeWidth={3.5} />
          </span>
        </div>
        <span className="text-[11px] font-bold tracking-[0.2em] text-[#81C995]">LOCKED IN</span>
        <span className="type-heading text-3xl font-bold">{won} joined your squad</span>
        <span className="quest-pop flex items-center gap-1.5 rounded-full bg-h-yellow px-4 py-1.5 text-lg font-black text-[#0A0A0A]">+{POINTS.meet}</span>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Link href="/quest/stage/squad" className={gameBtn}>
            See my squad
          </Link>
          <Link href="/quest/home" className={gameBtnGhost}>
            Back to the map
          </Link>
        </div>
      </div>
    );
  }

  const ready = questions.every((q) => answers[q.key]);

  return (
    <div className="flex flex-col gap-5">
      {header}
      {questions.map((q, n) => (
        <fieldset key={q.key} className="flex flex-col gap-2.5">
          <legend className="mb-2.5 flex items-center gap-2 text-[15px] font-bold">
            <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-g-red text-xs font-black">
              {n + 1}
            </span>
            {q.prompt}
          </legend>
          <div className="grid gap-2">
            {q.options.map((o) => {
              const on = answers[q.key] === o;
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setError(null);
                    setAnswers((a) => ({ ...a, [q.key]: o }));
                  }}
                  className={`min-h-12 rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-[transform,background-color,border-color] active:scale-[0.98] ${
                    on ? "border-h-yellow bg-[#1A1608]" : "border-white/[0.08] bg-[#121212] hover:border-white/25"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error && (
        <p role="alert" className="quest-pop rounded-2xl bg-g-red/20 px-4 py-3 text-center text-sm font-bold text-[#F8D8D8]">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!ready || pending || wait > 0}
        className={`${gameBtn} text-lg`}
        onClick={() =>
          start(async () => {
            const res = await lockInAction(token, {
              name: answers.name ?? "",
              stack: answers.stack ?? "",
              fact: answers.fact ?? "",
            });
            if (res.ok) return setWon(res.name);
            setError(res.message);
            if ("code" in res && (res.code === "miss" || res.code === "cooldown")) {
              const m = res.message.match(/(\d+)s/);
              setWait(m ? Number(m[1]) : 30);
            }
          })
        }
      >
        {pending ? "Checking…" : wait > 0 ? `Try again in ${wait}s` : "Lock in"}
      </button>
    </div>
  );
}

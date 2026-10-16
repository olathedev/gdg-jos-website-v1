"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { answerRoundAction, finishRoundAction, startRoundAction } from "@/app/quest/actions";
import { ROUND_QUESTIONS, ROUND_SECONDS } from "@/lib/quest/config";
import type { RoundView } from "@/lib/quest/stages";
import { StageBadge } from "./icons";
import { gameBtn } from "./ui";

type Playing = Extract<RoundView, { kind: "playing" }>;
const LETTERS = ["A", "B", "C", "D"];

export default function RoundPlayer({ round, initial }: { round: number; initial: Extract<RoundView, { kind: "ready" | "playing" }> }) {
  const router = useRouter();
  const [play, setPlay] = useState<Playing | null>(initial.kind === "playing" ? initial : null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(initial.kind === "playing" ? initial.score : 0);
  const [picked, setPicked] = useState<{ choice: number; correct: boolean; correctIndex: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [starting, startTransition] = useTransition();
  const finishing = useRef(false);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    await finishRoundAction(round);
    router.refresh();
  }, [round, router]);

  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [play]);

  const left = play ? Math.max(0, play.deadline - now) : ROUND_SECONDS * 1000;
  useEffect(() => {
    if (play && left <= 0) void finish();
  }, [play, left, finish]);

  if (!play) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <span aria-hidden className="quest-float">
          <StageBadge id="quiz" color="#F9AB00" size={88} />
        </span>
        <span className="text-[11px] font-bold tracking-[0.2em] text-h-yellow">ROUND {round}</span>
        <h1 className="type-heading text-3xl font-bold">Ready?</h1>
        <ul className="flex flex-col gap-1.5 text-sm text-white/70">
          <li>{ROUND_QUESTIONS} questions, {ROUND_SECONDS} seconds on the clock</li>
          <li>The clock starts the moment you tap Start</li>
          <li>One shot only. Ties go to the faster finish</li>
        </ul>
        {error && <p className="text-sm font-bold text-[#F8D8D8]">{error}</p>}
        <button
          type="button"
          disabled={starting}
          className={`${gameBtn} w-full max-w-xs text-lg`}
          onClick={() =>
            startTransition(async () => {
              const res = await startRoundAction(round);
              if (!res.ok) return setError(res.message);
              if (res.view.kind === "playing") {
                setNow(Date.now());
                setPlay(res.view);
              } else router.refresh();
            })
          }
        >
          {starting ? "Starting…" : "Start"}
        </button>
      </div>
    );
  }

  const q = play.questions[idx];
  const number = play.answered + idx + 1;
  const total = play.answered + play.questions.length;
  const secs = Math.ceil(left / 1000);
  const pct = (left / (ROUND_SECONDS * 1000)) * 100;

  async function choose(choice: number) {
    if (picked || !q) return;
    setPicked({ choice, correct: false, correctIndex: -1 });
    const res = await answerRoundAction(round, q.id, choice);
    if (!res.ok) {
      if (res.code === "timeup") return finish();
      setError(res.message);
      setPicked(null);
      return;
    }
    setPicked({ choice, correct: res.correct, correctIndex: res.correctIndex });
    if (res.correct) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= play!.questions.length) void finish();
      else setIdx((i) => i + 1);
    }, 650);
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-white/60">
          Q {Math.min(number, total)}/{total}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#141414] px-3 py-1">
          <Check aria-hidden className="size-3.5 text-g-green" strokeWidth={3.5} /> {score}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span aria-hidden className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <span
            className={`block h-full rounded-full transition-[width] duration-200 ease-linear ${
              secs <= 10 ? "bg-g-red" : secs <= 25 ? "bg-h-yellow" : "bg-g-green"
            }`}
            style={{ width: `${pct}%` }}
          />
        </span>
        <span
          role="timer"
          aria-label={`${secs} seconds left`}
          className={`type-heading w-12 text-right text-2xl font-bold tabular-nums ${secs <= 10 ? "animate-pulse text-g-red" : ""}`}
        >
          {secs}
        </span>
      </div>

      {q ? (
        <div key={q.id} className="quest-pop flex flex-col gap-4">
          <h1 className="type-heading min-h-[84px] text-center text-xl leading-snug font-bold">{q.question}</h1>
          <ul className="flex flex-col gap-2.5">
            {q.options.map((o, i) => {
              const state =
                picked && picked.correctIndex >= 0
                  ? i === picked.correctIndex
                    ? "right"
                    : i === picked.choice
                      ? "wrong"
                      : "dim"
                  : picked?.choice === i
                    ? "wait"
                    : "idle";
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={Boolean(picked)}
                    onClick={() => choose(i)}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-bold transition-[transform,background-color,border-color] active:scale-[0.98] ${
                      state === "right"
                        ? "border-g-green bg-g-green/25"
                        : state === "wrong"
                          ? "border-g-red bg-g-red/25"
                          : state === "wait"
                            ? "border-white/60 bg-white/10"
                            : state === "dim"
                              ? "border-white/5 bg-white/[0.02] opacity-50"
                              : "border-white/[0.08] bg-[#121212] hover:border-white/25"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-black"
                    >
                      {state === "right" ? (
                        <Check className="size-4" strokeWidth={3.5} />
                      ) : state === "wrong" ? (
                        <X className="size-4" strokeWidth={3.5} />
                      ) : (
                        LETTERS[i]
                      )}
                    </span>
                    {o}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="py-10 text-center text-white/60">Wrapping up…</p>
      )}
      {error && <p className="text-center text-sm font-bold text-[#F8D8D8]">{error}</p>}
    </div>
  );
}

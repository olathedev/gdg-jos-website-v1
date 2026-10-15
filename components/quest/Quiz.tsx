"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { answerAction } from "@/app/quest/actions";
import type { QuizCard } from "@/lib/quest/game";
import { Blob } from "./ui";

const letters = ["A", "B", "C", "D", "E"];
const colors = [
  { color: "#4285F4", tint: "#C3ECF6" },
  { color: "#EA4335", tint: "#F8D8D8" },
  { color: "#F9AB00", tint: "#FFE7A5" },
  { color: "#34A853", tint: "#CCF6C5" },
  { color: "#FF7DAF", tint: "#F8D8D8" },
];

type Feedback = { correct: boolean; correctIndex: number; explanation: string; points: number; picked: number };

export default function Quiz({ card }: { card: QuizCard }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, startPick] = useTransition();
  const [loadingNext, startNext] = useTransition();

  const pick = (i: number) =>
    startPick(async () => {
      setError(null);
      const res = await answerAction(card.id, i);
      if (!res.ok) return setError(res.message);
      setFeedback({ correct: res.correct, correctIndex: res.correctIndex, explanation: res.explanation, points: res.points, picked: i });
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{card.setLabel}</span>
        <span className="shrink-0 text-[#5F5F5F]">
          Card {card.position} of {card.setSize}
        </span>
      </div>
      <div aria-hidden className="flex h-2 gap-1">
        {Array.from({ length: card.setSize }, (_, i) => (
          <span
            key={i}
            className={`flex-1 rounded-full ${i < card.position - 1 || (i === card.position - 1 && feedback) ? "bg-ink" : i === card.position - 1 ? "bg-g-blue" : "bg-[#D6D6D6]"}`}
          />
        ))}
      </div>

      <Blob className="flex flex-col gap-2 bg-ink p-5 text-white">
        <span aria-hidden className="absolute top-2 right-5 text-5xl leading-none font-bold text-g-yellow">
          {"{ }"}
        </span>
        <span className="text-[11px] font-bold tracking-[0.1em] text-h-blue">LEARN</span>
        <p className="pr-10 text-[17px] leading-normal">{card.learn}</p>
      </Blob>

      <h1 className="type-heading text-[26px] leading-tight font-bold lg:text-3xl">{card.question}</h1>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Answers">
        {card.options.map((o, i) => {
          let look = "bg-white border-white hover:border-[#D6D6D6]";
          if (feedback && i === feedback.correctIndex) look = "bg-p-green border-g-green";
          else if (feedback && i === feedback.picked) look = "bg-p-red border-g-red";
          const c = colors[i % colors.length];
          return (
            <button
              key={i}
              type="button"
              disabled={Boolean(feedback) || picking}
              onClick={() => pick(i)}
              className={`flex min-h-[60px] items-center gap-3 rounded-[20px] border-2 px-3.5 py-2.5 text-left text-base leading-snug font-semibold transition-colors disabled:cursor-default ${look}`}
            >
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-[15px] font-bold"
                style={{ background: c.tint, borderColor: c.color }}
              >
                {letters[i]}
              </span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-p-red px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {feedback && (
        <>
          <div
            role="status"
            className={`relative flex flex-col gap-1.5 overflow-hidden rounded-3xl p-[18px] ${feedback.correct ? "bg-p-green" : "bg-p-red"}`}
          >
            {feedback.correct && (
              <>
                <span aria-hidden className="absolute top-3 right-6 size-3 rounded-full bg-g-blue" />
                <span aria-hidden className="absolute top-8 right-12 h-2 w-5 rotate-12 rounded-full bg-g-red" />
                <span aria-hidden className="absolute top-5 right-20 size-2.5 rounded-full bg-g-yellow" />
                <span aria-hidden className="absolute top-12 right-4 size-3 rotate-45 rounded-sm bg-g-green" />
              </>
            )}
            <span className="type-heading text-xl font-bold">
              {feedback.correct
                ? `Nailed it!${feedback.points ? ` +${feedback.points}` : ""}`
                : `Close one. It was ${letters[feedback.correctIndex]}`}
            </span>
            <p className="text-[15px] leading-normal">{feedback.explanation}</p>
          </div>
          <button
            type="button"
            disabled={loadingNext}
            onClick={() => startNext(() => router.refresh())}
            className="flex min-h-14 items-center justify-center rounded-full bg-ink text-base font-bold text-white hover:bg-ink/85 disabled:opacity-60"
          >
            {loadingNext ? "Loading…" : "Next card"}
          </button>
        </>
      )}
    </div>
  );
}

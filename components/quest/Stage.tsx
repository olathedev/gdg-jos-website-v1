import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { STAGES, type StageId } from "@/lib/quest/config";
import { LockGlyph, StageBadge } from "./icons";
import { gameBtn } from "./ui";

export const stageOf = (id: StageId) => STAGES.find((s) => s.id === id)!;

/** Stage badge, stage number and title, with an optional progress bar. */
export function StageHeader({
  id,
  progress,
  goal,
  done = false,
  children,
}: {
  id: StageId;
  progress?: number;
  goal?: number;
  done?: boolean;
  children?: ReactNode;
}) {
  const st = stageOf(id);
  return (
    <header className="flex flex-col items-center gap-3 pt-2 text-center">
      <Link href="/quest/map" className="flex min-h-11 items-center gap-1.5 self-start text-sm font-bold text-white/60 hover:text-white">
        <ArrowLeft aria-hidden className="size-4" /> Quest map
      </Link>
      <span aria-hidden className="quest-pop">
        <StageBadge id={id} color={st.color} size={80} />
      </span>
      <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: st.color }}>
        STAGE {st.num} {done && "· CLEARED"}
      </span>
      <h1 className="type-heading text-[28px] leading-tight font-bold">{st.title}</h1>
      <p className="max-w-xs text-sm text-white/65">{st.blurb}</p>
      {goal !== undefined && progress !== undefined && (
        <div className="flex w-full max-w-xs items-center gap-3">
          <span aria-hidden className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full transition-[width] duration-700"
              style={{ width: `${Math.min(100, (progress / goal) * 100)}%`, background: st.color }}
            />
          </span>
          <span className="text-sm font-bold tabular-nums">
            {Math.min(progress, goal)}/{goal}
          </span>
        </div>
      )}
      {children}
    </header>
  );
}

export function LockedStage({ id, message }: { id: StageId; message: string }) {
  const st = stageOf(id);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <span aria-hidden className="relative">
        <StageBadge id={id} color={st.color} size={80} locked />
        <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-[3px] border-[#0A0A0A] bg-[#2A2A2A] text-white/70">
          <LockGlyph size={14} />
        </span>
      </span>
      <span className="text-[11px] font-bold tracking-[0.2em] text-white/40">STAGE {st.num} · LOCKED</span>
      <h1 className="type-heading text-2xl font-bold">{st.title}</h1>
      <p className="max-w-xs text-sm text-white/65">{message}</p>
      <Link href="/quest/map" className={`${gameBtn} mt-2`}>
        Back to the quest map
      </Link>
    </div>
  );
}

/** Result banner after a scan or action, from ?r= in the URL. */
export function Banner({ tone, children }: { tone: "good" | "bad" | "info"; children: ReactNode }) {
  const cls =
    tone === "good"
      ? "border-g-green/40 bg-g-green/10 text-[#CCF6C5]"
      : tone === "bad"
        ? "border-g-red/40 bg-g-red/10 text-[#F8D8D8]"
        : "border-white/15 bg-white/[0.06] text-white";
  return (
    <p role="status" className={`quest-pop rounded-full border px-4 py-2.5 text-center text-sm font-bold ${cls}`}>
      {children}
    </p>
  );
}

/** How-to list with numbered chips in the stage colour. */
export function Steps({ id, steps }: { id: StageId; steps: string[] }) {
  const st = stageOf(id);
  return (
    <ol className="flex flex-col gap-1 rounded-[24px] border border-white/[0.08] bg-[#121212] p-2">
      {steps.map((text, i) => (
        <li key={text} className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5">
          <span
            aria-hidden
            className="type-heading flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#0A0A0A]"
            style={{ background: st.color }}
          >
            {i + 1}
          </span>
          <span className="text-sm font-semibold text-white/85">{text}</span>
        </li>
      ))}
    </ol>
  );
}

/** Centred empty or info state with a drawn mark instead of an emoji. */
export function Notice({ mark, title, children }: { mark: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <span aria-hidden className="quest-pop">
        {mark}
      </span>
      <h1 className="type-heading text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}

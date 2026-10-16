"use client";

import { useActionState, useState } from "react";
import { savePlayerAction, type Result } from "@/app/quest/actions";
import { AVATARS, STACKS } from "@/lib/quest/config";
import { AvatarArt } from "./icons";
import { GameAvatar, gameBtn } from "./ui";

type Initial = {
  full_name: string;
  avatar: string | null;
  stack: string[];
  fun_fact: string | null;
  is_adult: boolean;
  onboarded: boolean;
};

const FACT_IDEAS = ["I've never seen snow", "I can name every Pokémon", "I code with my left hand only", "I've been to 9 states"];

const shown = (name: string, adult: boolean) => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "Your name";
  return adult && p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toUpperCase()}.` : p[0];
};

const label = "text-[11px] font-bold tracking-[0.2em] text-white/50";
const field =
  "w-full rounded-2xl border border-white/[0.12] bg-[#121212] px-4 text-base text-white outline-none placeholder:text-white/30 focus:border-h-yellow";

export default function PlayerForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState<Result, FormData>(savePlayerAction, null);
  const [avatar, setAvatar] = useState(initial.avatar ?? AVATARS[0].id);
  const [name, setName] = useState(initial.full_name);
  const [picked, setPicked] = useState<string[]>(initial.stack);
  const [fact, setFact] = useState(initial.fun_fact ?? "");
  const [adult, setAdult] = useState(initial.is_adult);

  const toggle = (l: string) => setPicked((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : cur.length < 3 ? [...cur, l] : cur));

  return (
    <form action={action} className="flex flex-col gap-7">
      {/* Live card preview */}
      <div className="flex flex-col items-center gap-2 text-center">
        <GameAvatar avatar={avatar} size={96} className="quest-float" />
        <span className="type-heading text-2xl font-bold">{shown(name, adult)}</span>
        <span className="flex flex-wrap justify-center gap-1.5">
          {(picked.length ? picked : ["Your stack"]).map((p) => (
            <span key={p} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold">
              {p}
            </span>
          ))}
        </span>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${label} mb-3`}>PICK YOUR AVATAR</legend>
        <div className="grid grid-cols-4 gap-2.5">
          {AVATARS.map((a) => {
            const on = avatar === a.id;
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={on}
                aria-label={`Avatar ${a.id.slice(1)}`}
                onClick={() => setAvatar(a.id)}
                className={`flex aspect-square items-center justify-center rounded-full p-1 transition-transform active:scale-90 ${
                  on ? "scale-105 ring-[3px] ring-white ring-offset-2 ring-offset-[#0A0A0A]" : "opacity-75 hover:opacity-100"
                }`}
              >
                <AvatarArt spec={a} size={64} />
              </button>
            );
          })}
        </div>
        <input type="hidden" name="avatar" value={avatar} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="full_name" className={label}>
          YOUR NAME
        </label>
        <input
          id="full_name"
          name="full_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          autoComplete="name"
          className={`${field} h-14`}
        />
        <p className="text-xs text-white/50">
          Players see {adult ? `"${shown(name, adult)}"` : "your first name"}. They&apos;ll need to know it to lock you in.
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${label} mb-3 flex w-full justify-between`}>
          <span>YOUR STACK</span>
          <span>{picked.length}/3</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {STACKS.map((s) => {
            const on = picked.includes(s.label);
            return (
              <button
                key={s.label}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.label)}
                disabled={!on && picked.length >= 3}
                className={`flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-colors disabled:opacity-35 ${
                  on ? "text-[#0A0A0A]" : "border-white/[0.12] bg-[#121212] text-white"
                }`}
                style={on ? { background: s.tint, borderColor: s.color } : undefined}
              >
                <span aria-hidden className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            );
          })}
        </div>
        {picked.map((p) => (
          <input key={p} type="hidden" name="stack" value={p} />
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="fun_fact" className={label}>
          A FUN FACT ABOUT YOU
        </label>
        <textarea
          id="fun_fact"
          name="fun_fact"
          value={fact}
          onChange={(e) => setFact(e.target.value)}
          required
          rows={2}
          maxLength={90}
          placeholder={`e.g. ${FACT_IDEAS[0]}`}
          className={`${field} resize-none py-3`}
        />
        <p className="flex justify-between text-xs text-white/50">
          <span>Players who scan you get quizzed on this. Make it memorable.</span>
          <span className="tabular-nums">{fact.length}/90</span>
        </p>
      </div>

      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#121212] px-4 text-[15px] font-bold">
        <input type="checkbox" name="is_adult" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="size-5 accent-h-yellow" />
        I am 18 or over
      </label>

      {state && (
        <p role="status" className={`rounded-full border px-4 py-2.5 text-center text-sm font-bold ${state.ok ? "border-g-green/40 bg-g-green/10 text-[#CCF6C5]" : "border-g-red/40 bg-g-red/10 text-[#F8D8D8]"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${gameBtn} text-lg`}>
        {pending ? "Saving…" : initial.onboarded ? "Save my card" : "Start the quest"}
      </button>
    </form>
  );
}

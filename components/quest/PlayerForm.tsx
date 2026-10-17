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
  github: string | null;
  linkedin: string | null;
  x_handle: string | null;
  instagram: string | null;
  whatsapp: string | null;
  share_whatsapp: boolean;
  onboarded: boolean;
};

const SOCIALS = [
  { id: "github", label: "GitHub", prefix: "github.com/", placeholder: "yourname" },
  { id: "linkedin", label: "LinkedIn", prefix: "linkedin.com/in/", placeholder: "your-name" },
  { id: "x_handle", label: "X", prefix: "x.com/", placeholder: "yourhandle" },
  { id: "instagram", label: "Instagram", prefix: "instagram.com/", placeholder: "yourname" },
] as const;

function Toggle({
  name,
  checked,
  onChange,
  disabled = false,
  title,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  title: string;
  hint?: string;
}) {
  return (
    <label className={`flex min-h-14 items-center gap-3 px-4 py-3 ${disabled ? "opacity-40" : "cursor-pointer"}`}>
      <span className="flex flex-1 flex-col">
        <span className="text-[15px] font-bold">{title}</span>
        {hint && <span className="text-xs text-white/50">{hint}</span>}
      </span>
      <input
        type="checkbox"
        name={name}
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-white/15 transition-colors peer-checked:bg-g-green peer-focus-visible:outline-2 peer-focus-visible:outline-h-yellow after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}

const FACT_IDEAS = ["I've never seen snow", "I can name every Pokémon", "I code with my left hand only", "I've been to 9 states"];

const shown = (name: string) => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "Your name";
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toUpperCase()}.` : p[0];
};

const label = "text-[11px] font-bold tracking-[0.2em] text-white/50";
const field =
  "w-full rounded-2xl border border-white/[0.12] bg-[#121212] px-4 text-base text-white outline-none placeholder:text-white/30 focus:border-h-yellow";

export default function PlayerForm({ initial, next }: { initial: Initial; next?: string | null }) {
  const [state, action, pending] = useActionState<Result, FormData>(savePlayerAction, null);
  const [avatar, setAvatar] = useState(initial.avatar ?? AVATARS[0].id);
  const [name, setName] = useState(initial.full_name);
  const [picked, setPicked] = useState<string[]>(initial.stack);
  const [fact, setFact] = useState(initial.fun_fact ?? "");
  const [socialError, setSocialError] = useState(false);
  const [shareWa, setShareWa] = useState(initial.share_whatsapp);

  const toggle = (l: string) => setPicked((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : cur.length < 3 ? [...cur, l] : cur));

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const f = e.currentTarget;
        const any = ["github", "linkedin", "x_handle", "instagram"].some(
          (n) => (f.elements.namedItem(n) as HTMLInputElement | null)?.value.trim(),
        );
        setSocialError(!any);
        if (!any) {
          e.preventDefault();
          (f.elements.namedItem("github") as HTMLInputElement | null)?.focus();
        }
      }}
      className="flex flex-col gap-7"
    >
      {next && <input type="hidden" name="next" value={next} />}
      {/* Live card preview */}
      <div className="flex flex-col items-center gap-2 text-center">
        <GameAvatar avatar={avatar} size={96} className="quest-float" />
        <span className="type-heading text-2xl font-bold">{shown(name)}</span>
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
          The leaderboard shows &quot;{shown(name)}&quot;. Padis you accept see your full name.
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
          A FUN FACT ABOUT YOU <span className="text-white/30">(OPTIONAL)</span>
        </label>
        <textarea
          id="fun_fact"
          name="fun_fact"
          value={fact}
          onChange={(e) => setFact(e.target.value)}
          rows={2}
          maxLength={90}
          placeholder={`e.g. ${FACT_IDEAS[0]}`}
          className={`${field} resize-none py-3`}
        />
        <p className="flex justify-between text-xs text-white/50">
          <span>Shown on your card. A great conversation starter.</span>
          <span className="tabular-nums">{fact.length}/90</span>
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${label} mb-3`}>
          SOCIALS <span className="text-h-yellow">· ADD AT LEAST ONE (USERNAME ONLY)</span>
        </legend>
        {SOCIALS.map((f) => (
          <div key={f.id} className="flex h-13 items-center overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121212] focus-within:border-h-yellow">
            <label htmlFor={f.id} className="w-24 shrink-0 pl-4 text-sm font-bold">
              {f.label}
            </label>
            <span className="text-sm text-white/35">{f.prefix}</span>
            <input
              id={f.id}
              name={f.id}
              defaultValue={initial[f.id] ?? ""}
              placeholder={f.placeholder}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={100}
              className="h-full min-w-0 flex-1 bg-transparent pr-4 text-[15px] text-white outline-none placeholder:text-white/25"
            />
          </div>
        ))}
        <div className="flex h-13 items-center overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121212] focus-within:border-h-yellow">
          <label htmlFor="whatsapp" className="w-24 shrink-0 pl-4 text-sm font-bold">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={initial.whatsapp ? `+${initial.whatsapp}` : ""}
            placeholder="0803 000 0000"
            className="h-full min-w-0 flex-1 bg-transparent pr-4 text-[15px] text-white outline-none placeholder:text-white/25"
          />
        </div>
        {socialError && (
          <p role="alert" className="text-sm font-bold text-[#F8D8D8]">
            Add at least one of GitHub, LinkedIn, X or Instagram so your padis can find you.
          </p>
        )}
        <p className="text-xs leading-relaxed text-white/50">
          We build every link ourselves, so nobody can hide a dodgy link. Socials are only shown to padis you accept.
        </p>
      </fieldset>

      <div className="flex flex-col divide-y divide-white/[0.06] rounded-[24px] border border-white/[0.12] bg-[#121212]">
        <Toggle
          name="share_whatsapp"
          checked={shareWa}
          onChange={setShareWa}
          title="Share my WhatsApp with padis"
          hint="Only people you accept or scan see it"
        />
      </div>

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

"use client";

import { useActionState, useState } from "react";
import { saveProfileAction, type Result } from "@/app/quest/actions";
import { STACKS } from "@/lib/quest/config";
import { Avatar, Blob, input, pillDark } from "./ui";

type Initial = {
  id: string;
  full_name: string;
  stack: string[];
  github: string | null;
  linkedin: string | null;
  x_handle: string | null;
  instagram: string | null;
  whatsapp: string | null;
  is_adult: boolean;
  listed: boolean;
  share_whatsapp: boolean;
  onboarded: boolean;
};

const short = (name: string) => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "Your name";
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toUpperCase()}.` : p[0];
};
const inits = (name: string) => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "A") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
};

function Handle({ id, label, prefix, value, placeholder }: { id: string; label: string; prefix: string; value: string | null; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] text-[#5F5F5F]">
        {label}
      </label>
      <div className="flex h-12 items-center overflow-hidden rounded-full border border-[#D6D6D6] bg-[#F7F7F7] focus-within:border-g-blue focus-within:ring-2 focus-within:ring-g-blue/25">
        <span className="pr-0.5 pl-4 text-sm text-[#5F5F5F]">{prefix}</span>
        <input
          id={id}
          name={id}
          defaultValue={value ?? ""}
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={100}
          className="h-full min-w-0 flex-1 bg-transparent pr-4 text-[15px] outline-none"
        />
      </div>
    </div>
  );
}

export default function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState<Result, FormData>(saveProfileAction, null);
  const [name, setName] = useState(initial.full_name);
  const [picked, setPicked] = useState<string[]>(initial.stack);
  const [adult, setAdult] = useState(initial.is_adult);

  const toggle = (label: string) =>
    setPicked((cur) => (cur.includes(label) ? cur.filter((x) => x !== label) : cur.length < 3 ? [...cur, label] : cur));

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <Blob className="flex flex-col gap-2.5 bg-p-blue p-5 lg:sticky lg:top-10">
        <span aria-hidden className="absolute top-1.5 right-[18px] text-[64px] leading-none font-bold text-g-blue">
          {"{ }"}
        </span>
        <span className="text-[11px] font-bold tracking-[0.1em] text-[#1967D2]">AGENT CARD PREVIEW</span>
        <div className="flex items-center gap-3">
          <Avatar id={initial.id} initials={inits(name)} size={52} className="!bg-ink !text-h-yellow" />
          <div className="flex flex-col">
            <span className="type-heading text-2xl font-bold">{adult ? short(name) : name.trim().split(/\s+/)[0] || "Your name"}</span>
            <span className="text-[13px] text-textDark">Coming to DevFest Jos</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(picked.length ? picked : ["Pick up to 3"]).map((p) => (
            <span key={p} className="rounded-full bg-white px-3 py-1 text-xs font-bold">
              {p}
            </span>
          ))}
        </div>
      </Blob>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="full_name" className="text-sm font-bold">
            Display name
          </label>
          <input
            id="full_name"
            name="full_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            autoComplete="name"
            className={input}
          />
          <p className="text-[13px] text-[#5F5F5F]">
            {adult ? `Shown as ${short(name)}` : "Shown as your first name."} Your full name goes only to people you accept.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 flex w-full items-baseline justify-between">
            <span className="text-sm font-bold">Pick your stack</span>
            <span className="text-[13px] text-[#5F5F5F]">{picked.length} of 3 picked</span>
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
                  className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  style={on ? { background: s.tint, border: `2px solid ${s.color}` } : { background: "#fff", border: "1px solid #D6D6D6" }}
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

        <div className="flex flex-col gap-3 rounded-3xl bg-white p-[18px]">
          <span className="text-sm font-bold">Socials (optional)</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <Handle id="github" label="GitHub username" prefix="github.com/" value={initial.github} placeholder="yourname" />
            <Handle id="linkedin" label="LinkedIn username" prefix="linkedin.com/in/" value={initial.linkedin} placeholder="your-name" />
            <Handle id="x_handle" label="X handle" prefix="x.com/" value={initial.x_handle} placeholder="yourhandle" />
            <Handle id="instagram" label="Instagram username" prefix="instagram.com/" value={initial.instagram} placeholder="yourname" />
          </div>
          {adult && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="whatsapp" className="text-[13px] text-[#5F5F5F]">
                WhatsApp number
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                defaultValue={initial.whatsapp ? `+${initial.whatsapp}` : ""}
                placeholder="0803 000 0000"
                className={`${input} h-12 bg-[#F7F7F7] px-4 text-[15px]`}
              />
            </div>
          )}
          <p className="text-[12.5px] leading-normal text-[#5F5F5F]">
            Usernames only. We build the links, so nobody can disguise a link to another site.
          </p>
        </div>

        <div className="flex flex-col rounded-3xl bg-p-yellow px-[18px] py-2">
          <label className="flex min-h-[50px] items-center gap-3 text-[15px] font-semibold">
            <input
              type="checkbox"
              name="is_adult"
              checked={adult}
              onChange={(e) => setAdult(e.target.checked)}
              className="size-[22px] accent-ink"
            />
            I am 18 or over
          </label>
          <label className={`flex min-h-[50px] items-center gap-3 border-t border-[#F2D27C] text-[15px] font-semibold ${adult ? "" : "opacity-50"}`}>
            <input type="checkbox" name="listed" defaultChecked={initial.listed} disabled={!adult} className="size-[22px] accent-ink" />
            Show me in Who&apos;s coming
          </label>
          <label className={`flex min-h-[50px] items-center gap-3 border-t border-[#F2D27C] text-[15px] font-semibold ${adult ? "" : "opacity-50"}`}>
            <input
              type="checkbox"
              name="share_whatsapp"
              defaultChecked={initial.share_whatsapp}
              disabled={!adult}
              className="size-[22px] accent-ink"
            />
            Share my WhatsApp with people I accept
          </label>
        </div>
        <p className="text-[12.5px] leading-normal text-[#5F5F5F]">
          Under 18? You can still play and appear on the leaderboard by first name, but you won&apos;t be listed in Who&apos;s
          coming. We use your details only for Agent Mode at DevFest Jos 2026.
        </p>

        {state && (
          <p role="status" className={`rounded-2xl px-4 py-3 text-sm font-semibold ${state.ok ? "bg-p-green" : "bg-p-red"}`}>
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className={`${pillDark} min-h-14 text-base`}>
          {pending ? "Saving…" : initial.onboarded ? "Save changes" : "Save and power up"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { Check, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { connectAction } from "@/app/quest/actions";
import { STACKS } from "@/lib/quest/config";
import type { Agent, ConnState } from "@/lib/quest/game";
import { isHereNow } from "@/lib/quest/presence";
import ActiveDot from "./ActiveDot";
import BlockMenu from "./BlockMenu";
import Celebration from "./Celebration";
import { GameAvatar, stackStyle } from "./ui";

/** Directory: search by name, filter by stack, one tap to send a padi request. */
export default function PeopleList({ people, canConnect, now }: { people: Agent[]; canConnect: boolean; now: number }) {
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState<string | null>(null);
  const [hereNow, setHereNow] = useState(false);
  const [states, setStates] = useState<Record<string, ConnState>>({});
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const stacks = useMemo(() => STACKS.filter((s) => people.some((p) => p.stack.includes(s.label))), [people]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = people.filter(
      (p) =>
        !gone.has(p.id) &&
        (!q || p.name.toLowerCase().includes(q)) &&
        (!stack || p.stack.includes(stack)) &&
        (!hereNow || isHereNow(p.lastActive, now)),
    );
    // Here now: most recently active first.
    return hereNow ? [...list].sort((a, b) => (b.lastActive ?? "").localeCompare(a.lastActive ?? "")) : list;
  }, [people, query, stack, gone, hereNow, now]);
  const hereCount = useMemo(() => people.filter((p) => isHereNow(p.lastActive, now)).length, [people, now]);

  const [party, setParty] = useState<string | null>(null);
  const ask = (id: string, current: ConnState, name: string) =>
    start(async () => {
      setError(null);
      setStates((s) => ({ ...s, [id]: current === "incoming" ? "connected" : "requested" }));
      const res = await connectAction(id);
      if (res && !res.ok) {
        setStates((s) => ({ ...s, [id]: current }));
        setError(res.message);
      } else if (res?.padi) {
        setStates((s) => ({ ...s, [id]: "connected" }));
        setParty(`You and ${name} are now padis!`);
      }
    });

  return (
    <div className="flex flex-col gap-4">
      {party && <Celebration message={party} onDone={() => setParty(null)} />}
      <div role="group" aria-label="Show" className="grid grid-cols-2 gap-1 rounded-full border border-fg/[0.12] bg-surface p-1">
        {[
          { on: !hereNow, label: `Everyone · ${people.length}`, set: false },
          { on: hereNow, label: `Here now · ${hereCount}`, set: true },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            aria-pressed={t.on}
            onClick={() => setHereNow(t.set)}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-colors ${
              t.on ? "bg-fg text-on-fg" : "text-fg/70 hover:text-fg"
            }`}
          >
            {t.set && <span aria-hidden className="size-2 rounded-full bg-live" />}
            {t.label}
          </button>
        ))}
      </div>

      <label className="flex h-13 items-center gap-2.5 rounded-full border border-fg/[0.12] bg-surface px-4 focus-within:border-h-yellow">
        <Search aria-hidden className="size-4 text-fg/40" />
        <span className="sr-only">Search by name</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg/35"
        />
      </label>

      {stacks.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by stack">
          {[{ label: "All", color: "#fff" }, ...stacks].map((s) => {
            const on = s.label === "All" ? !stack : stack === s.label;
            return (
              <button
                key={s.label}
                type="button"
                aria-pressed={on}
                onClick={() => setStack(s.label === "All" ? null : s.label)}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition-colors ${
                  on ? "border-fg bg-fg text-on-fg" : "border-fg/[0.12] bg-surface text-fg/80"
                }`}
              >
                {s.label !== "All" && <span aria-hidden className="size-1.5 rounded-full" style={{ background: s.color }} />}
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-full border border-g-red/40 bg-g-red/10 px-4 py-2.5 text-center text-sm font-bold text-bad">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="rounded-[24px] border border-fg/[0.08] bg-surface px-5 py-10 text-center text-sm text-fg/60">
          {people.length === 0 ? "No one else is here yet. Share your QR and get people playing." : hereNow ? "No one matching is active right now." : "No one matches that."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {shown.map((p) => {
            const st = states[p.id] ?? p.state;
            return (
              <li key={p.id} className="flex flex-col gap-3 rounded-[24px] border border-fg/[0.08] bg-surface p-3.5">
                <div className="flex items-start gap-3">
                  <GameAvatar avatar={p.avatar} initials={p.initials} size={52} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-base font-bold">{p.name}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span key={s} className="flex items-center gap-1 text-xs font-semibold text-fg/60">
                          <span aria-hidden className="size-1.5 rounded-full" style={{ background: stackStyle(s).color }} />
                          {s}
                        </span>
                      ))}
                    </span>
                    {p.funFact && <span className="text-[13px] leading-snug text-fg/70">{p.funFact}</span>}
                    <ActiveDot at={p.lastActive} now={now} />
                  </div>
                  <BlockMenu id={p.id} name={p.name.split(" ")[0]} onDone={() => setGone((g) => new Set(g).add(p.id))} />
                </div>
                {canConnect &&
                  (st === "connected" ? (
                    <Link
                      href="/quest/crew"
                      className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-g-green/50 text-sm font-bold text-good"
                    >
                      <Check aria-hidden className="size-4" strokeWidth={3} /> Padis · see socials
                    </Link>
                  ) : st === "requested" ? (
                    <span className="flex min-h-11 items-center justify-center rounded-full border border-fg/15 text-sm font-bold text-fg/60">
                      Request sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => ask(p.id, st, p.name)}
                      className="flex min-h-11 items-center justify-center rounded-full bg-fg text-sm font-bold text-on-fg transition-transform active:scale-[0.97]"
                    >
                      {st === "incoming" ? "Accept their padi request" : "Be my padi"}
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

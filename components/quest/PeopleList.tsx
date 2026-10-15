"use client";

import { Search } from "lucide-react";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { connectAction, respondAction } from "@/app/quest/actions";
import { STACK_LABELS } from "@/lib/quest/config";
import type { Agent, ConnState } from "@/lib/quest/game";
import { Avatar, StackTag } from "./ui";

const btn = "min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors";

export default function PeopleList({ agents, canConnect }: { agents: Agent[]; canConnect: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const [states, setState] = useOptimistic(
    Object.fromEntries(agents.map((a) => [a.id, a.state])) as Record<string, ConnState>,
    (cur, [id, s]: [string, ConnState]) => ({ ...cur, [id]: s }),
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter(
      (a) => (filter === "All" || a.stack.includes(filter)) && (!q || a.name.toLowerCase().includes(q)),
    );
  }, [agents, filter, query]);

  const act = (a: Agent) =>
    start(async () => {
      setError(null);
      const s = states[a.id];
      setState([a.id, s === "incoming" ? "connected" : "requested"]);
      const res = s === "incoming" ? await respondAction(a.id, true) : await connectAction(a.id);
      if (res && !res.ok) setError(res.message);
    });

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative">
        <label htmlFor="search" className="sr-only">
          Search agents by name
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-[#5F5F5F]" />
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          className="h-[50px] w-full rounded-full border border-[#D6D6D6] bg-white pr-5 pl-11 text-[15px] outline-none focus:border-g-blue focus:ring-2 focus:ring-g-blue/25"
        />
      </div>
      <div className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-label="Filter by stack">
        {["All", ...STACK_LABELS].map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={label === filter}
            onClick={() => setFilter(label)}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              label === filter ? "border-ink bg-ink text-white" : "border-[#D6D6D6] bg-white hover:border-ink/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-p-red px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="rounded-3xl bg-white px-5 py-8 text-center text-[15px] text-[#5F5F5F]">
          {agents.length === 0 ? "Nobody's listed yet. Share your invite link to get the crew in." : "No agents match that."}
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {shown.map((a) => {
            const s = states[a.id];
            return (
              <li key={a.id} className="flex items-start gap-3 rounded-3xl bg-white px-4 py-3.5">
                <Avatar id={a.id} initials={a.initials} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-base font-bold">{a.name}</span>
                  {a.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {a.stack.map((t) => (
                        <StackTag key={t} label={t} />
                      ))}
                    </div>
                  )}
                  {a.socials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {a.socials.map((x) => (
                        <a
                          key={x.label}
                          href={x.href}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="flex min-h-8 items-center rounded-full bg-paper px-3 text-xs font-semibold hover:bg-[#E4E4E4]"
                        >
                          {x.label}
                          <span className="sr-only"> profile of {a.name} (opens in a new tab)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {canConnect &&
                  (s === "connected" ? (
                    <span className={`${btn} flex items-center bg-p-green`}>Connected</span>
                  ) : s === "requested" ? (
                    <span className={`${btn} flex items-center border border-[#D6D6D6] text-[#5F5F5F]`}>Requested</span>
                  ) : (
                    <button type="button" onClick={() => act(a)} className={`${btn} bg-ink text-white hover:bg-ink/85`}>
                      {s === "incoming" ? "Accept" : "Connect"}
                      <span className="sr-only"> with {a.name}</span>
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

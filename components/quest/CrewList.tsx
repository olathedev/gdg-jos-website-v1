"use client";

import { useOptimistic, useState, useTransition } from "react";
import { blockAction, respondAction } from "@/app/quest/actions";
import { POINTS } from "@/lib/quest/config";
import type { CrewMember } from "@/lib/quest/game";
import { Avatar, SectionLabel } from "./ui";

const pills: Record<string, string> = {
  WhatsApp: "bg-p-green",
  LinkedIn: "bg-p-blue",
  X: "bg-[#E4E4E4]",
  Instagram: "bg-p-red",
  GitHub: "bg-[#E4E4E4]",
};
const btn = "min-h-11 rounded-full px-4 text-sm font-bold transition-colors";

function BlockPanel({ who, onDone }: { who: CrewMember; onDone: (msg: string | null) => void }) {
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const go = (report: boolean) =>
    start(async () => {
      const res = await blockAction(who.id, report, reason);
      onDone(res?.ok ? null : (res?.message ?? "Try again."));
    });
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-paper p-3.5">
      <p className="text-sm leading-normal">
        Blocking hides you and {who.name} from each other everywhere. Reporting also sends it to an organiser.
      </p>
      <label htmlFor={`reason-${who.id}`} className="sr-only">
        What happened (optional)
      </label>
      <textarea
        id={`reason-${who.id}`}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="What happened? (optional)"
        className="rounded-2xl border border-[#D6D6D6] bg-white px-4 py-3 text-sm outline-none focus:border-g-blue"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => go(false)} className={`${btn} bg-ink text-white`}>
          Block
        </button>
        <button type="button" disabled={pending} onClick={() => go(true)} className={`${btn} bg-g-red text-white`}>
          Report and block
        </button>
        <button type="button" onClick={() => onDone(null)} className={`${btn} text-[#5F5F5F]`}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CrewList({ pending, connected }: { pending: CrewMember[]; connected: CrewMember[] }) {
  const [, start] = useTransition();
  const [blocking, setBlocking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hidden, hide] = useOptimistic<string[], string>([], (cur, id) => [...cur, id]);
  const waiting = pending.filter((p) => !hidden.includes(p.id));

  const respond = (id: string, accept: boolean) =>
    start(async () => {
      hide(id);
      const res = await respondAction(id, accept);
      if (res && !res.ok) setError(res.message);
    });

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      <section className="flex flex-col gap-3">
        <SectionLabel color="bg-g-red">Waiting for you ({waiting.length})</SectionLabel>
        {error && (
          <p role="alert" className="rounded-2xl bg-p-red px-4 py-3 text-sm font-semibold">
            {error}
          </p>
        )}
        {waiting.length === 0 && (
          <p className="rounded-3xl bg-white px-5 py-6 text-center text-[15px] text-[#5F5F5F]">
            All caught up. New requests land here.
          </p>
        )}
        {waiting.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 rounded-3xl bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar id={r.id} initials={r.initials} />
              <div className="flex flex-col">
                <span className="text-base font-bold">{r.name}</span>
                <span className="text-[13px] text-[#5F5F5F]">{r.stack.join(" · ") || "No stack yet"}</span>
              </div>
            </div>
            {blocking === r.id ? (
              <BlockPanel
                who={r}
                onDone={(msg) => {
                  setBlocking(null);
                  setError(msg);
                }}
              />
            ) : (
              <>
                <div className="flex gap-2">
                  <button type="button" onClick={() => respond(r.id, true)} className={`${btn} flex-1 bg-ink text-white hover:bg-ink/85`}>
                    Accept
                  </button>
                  <button type="button" onClick={() => respond(r.id, false)} className={`${btn} flex-1 border border-[#D6D6D6] hover:bg-paper`}>
                    Not now
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setBlocking(r.id)}
                  className="min-h-11 self-start px-1 text-[13px] font-semibold text-[#5F5F5F] underline-offset-2 hover:underline"
                >
                  Block or report
                </button>
              </>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel color="bg-g-green">Connected ({connected.length})</SectionLabel>
        {connected.length === 0 && (
          <p className="rounded-3xl bg-white px-5 py-6 text-center text-[15px] text-[#5F5F5F]">
            Nobody yet. Tap Connect on someone in Who&apos;s coming.
          </p>
        )}
        {connected.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-3xl bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar id={c.id} initials={c.initials} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-base font-bold">{c.fullName}</span>
                <span className="text-[13px] text-[#5F5F5F]">{c.stack.join(" · ") || "No stack yet"}</span>
              </div>
            </div>
            {c.contacts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {c.contacts.map((k) => (
                  <a
                    key={k.label}
                    href={k.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`flex min-h-11 items-center rounded-full px-[18px] text-sm font-bold ${pills[k.label] ?? "bg-paper"}`}
                  >
                    {k.label}
                    <span className="sr-only"> of {c.fullName} (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#5F5F5F]">No contacts shared.</p>
            )}
            <p className="rounded-2xl bg-paper px-3.5 py-2.5 text-[13px] font-semibold">
              {c.met ? "Met in person." : `Find each other on 17 Oct and scan: +${POINTS.meet} points each.`}
            </p>
            {blocking === c.id ? (
              <BlockPanel
                who={c}
                onDone={(msg) => {
                  setBlocking(null);
                  setError(msg);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setBlocking(c.id)}
                className="min-h-11 self-start px-1 text-[13px] font-semibold text-[#5F5F5F] underline-offset-2 hover:underline"
              >
                Block or report
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { respondAction } from "@/app/quest/actions";
import type { CrewMember } from "@/lib/quest/game";
import ActiveDot from "./ActiveDot";
import BlockMenu from "./BlockMenu";
import Celebration from "./Celebration";
import { BrandMark } from "./icons";
import { GameAvatar, stackStyle } from "./ui";

const brandId = (label: string) =>
  ({ WhatsApp: "whatsapp", GitHub: "github", LinkedIn: "linkedin", X: "x", Instagram: "instagram" })[label] ?? "x";

function Stack({ stack }: { stack: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {stack.map((s) => (
        <span key={s} className="flex items-center gap-1 text-xs font-semibold text-fg/60">
          <span aria-hidden className="size-1.5 rounded-full" style={{ background: stackStyle(s).color }} />
          {s}
        </span>
      ))}
    </span>
  );
}

const card = "flex flex-col gap-3 rounded-[24px] border border-fg/[0.08] bg-surface p-3.5";

/** Incoming padi requests (accept or decline) and padis with their shared contacts. */
export default function CrewList({ pending, connected, now }: { pending: CrewMember[]; connected: CrewMember[]; now: number }) {
  const [done, setDone] = useState<Record<string, "accepted" | "declined">>({});
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [, start] = useTransition();

  const [party, setParty] = useState<string | null>(null);
  const respond = (id: string, accept: boolean, name: string) =>
    start(async () => {
      setDone((d) => ({ ...d, [id]: accept ? "accepted" : "declined" }));
      const res = await respondAction(id, accept);
      if (res?.padi) setParty(`You and ${name} are now padis!`);
    });

  const requests = pending.filter((p) => !gone.has(p.id) && done[p.id] !== "declined");
  const padis = connected.filter((p) => !gone.has(p.id));

  return (
    <div className="flex flex-col gap-7">
      {party && <Celebration message={party} onDone={() => setParty(null)} />}
      {requests.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="req-h">
          <h2 id="req-h" className="text-[11px] font-bold tracking-[0.2em] text-hl">
            REQUESTS · {requests.length}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {requests.map((p) => (
              <li key={p.id} className={card}>
                <div className="flex items-start gap-3">
                  <GameAvatar avatar={p.avatar} initials={p.initials} size={52} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-base font-bold">{p.name}</span>
                    <Stack stack={p.stack} />
                    {p.funFact && <span className="text-[13px] leading-snug text-fg/70">{p.funFact}</span>}
                    <ActiveDot at={p.lastActive} now={now} />
                  </div>
                  <BlockMenu id={p.id} name={p.name.split(" ")[0]} onDone={() => setGone((g) => new Set(g).add(p.id))} />
                </div>
                {done[p.id] === "accepted" ? (
                  <p className="text-center text-sm font-bold text-good">Accepted! Their socials are below.</p>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => respond(p.id, true, p.name)}
                      className="min-h-11 flex-1 rounded-full bg-fg text-sm font-bold text-on-fg active:scale-[0.97]"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(p.id, false, p.name)}
                      className="min-h-11 flex-1 rounded-full border border-fg/15 text-sm font-bold text-fg/80"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="padis-h">
        <h2 id="padis-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/45">
          MY PADIS · {padis.length}
        </h2>
        {padis.length === 0 ? (
          <p className="rounded-[24px] border border-fg/[0.08] bg-surface px-5 py-8 text-center text-sm text-fg/60">
            No padis yet. Scan someone&apos;s QR or send a request from People.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {padis.map((p) => (
              <li key={p.id} className={card}>
                <div className="flex items-start gap-3">
                  <GameAvatar avatar={p.avatar} initials={p.initials} size={52} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-base font-bold">{p.fullName}</span>
                    <Stack stack={p.stack} />
                    {p.funFact && <span className="text-[13px] leading-snug text-fg/70">{p.funFact}</span>}
                    {p.met && <span className="text-[11px] font-bold tracking-wider text-live">MET IN PERSON</span>}
                    <ActiveDot at={p.lastActive} now={now} />
                  </div>
                  <BlockMenu id={p.id} name={p.name.split(" ")[0]} onDone={() => setGone((g) => new Set(g).add(p.id))} />
                </div>
                {p.contacts.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {p.contacts.map((c) => (
                      <li key={c.label}>
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-10 items-center gap-2 rounded-full border border-fg/[0.12] px-3.5 text-sm font-bold hover:bg-fg/[0.05]"
                        >
                          <BrandMark id={brandId(c.label)} size={16} />
                          {c.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-fg/45">They haven&apos;t added any socials yet.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { checkInCodeAction, searchTicketsAction, undoCheckInAction } from "@/app/admin-internal/checkin/actions";
import { useQrCamera } from "@/components/quest/useQrCamera";
import type { CheckinResult, CheckinTicket } from "@/lib/admin/checkin";
import { isTierId, tiers } from "@/lib/tickets/tiers";

const time = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(iso));
const tierName = (t: string) => (isTierId(t) ? tiers[t].name : t);
const merchLine = (t: CheckinTicket) => (t.merch === "shirt" ? `T-shirt${t.shirt ? ` · ${t.shirt}` : ""}` : t.merch === "tote" ? "Tote bag" : null);

/** Door check-in: scan a ticket QR, or type a code / search a name. One big result at a time. */
export default function CheckinDesk({ checked, total }: { checked: number; total: number }) {
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [count, setCount] = useState(checked);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CheckinTicket[] | null>(null);
  const [, start] = useTransition();
  const last = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const resume = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = (raw: string) => {
    if (busy) return;
    setBusy(true);
    start(async () => {
      try {
        const res = await checkInCodeAction(raw);
        setResult(res);
        navigator.vibrate?.(res.kind === "ok" ? 60 : [80, 60, 80]);
        if (res.kind === "ok") {
          setCount((c) => c + 1);
          clearTimeout(resume.current);
          resume.current = setTimeout(() => setResult(null), 3500);
        }
      } finally {
        setBusy(false);
      }
    });
  };

  const { video, status, retry } = useQrCamera((text) => {
    const now = Date.now();
    if (text === last.current.text && now - last.current.at < 5000) return;
    last.current = { text, at: now };
    run(text);
  }, Boolean(result) || busy);

  useEffect(() => () => clearTimeout(resume.current), []);

  const undo = (id: string) =>
    start(async () => {
      await undoCheckInAction(id);
      setCount((c) => Math.max(0, c - 1));
      setResult(null);
    });

  const search = (q: string) => {
    setQuery(q);
    if (q.trim().length < 3) return setMatches(null);
    start(async () => setMatches(await searchTicketsAction(q)));
  };

  const blocked = status === "denied" || status === "nocamera";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Check-in</h1>
        <p className="text-sm text-zinc-500 tabular-nums">
          <span className="font-semibold text-ink">{count}</span> / {total} in
        </p>
      </div>

      {/* Camera */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-zinc-900">
        <video ref={video} playsInline muted className={`size-full object-cover ${blocked ? "hidden" : ""}`} />
        {!result && !blocked && (
          <span aria-hidden className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-white/70" />
        )}
        {status === "starting" && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Starting camera…</p>
        )}
        {blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
            <p className="font-semibold">{status === "denied" ? "Camera is blocked" : "No camera found"}</p>
            <p className="text-sm text-white/70">Allow camera access for this site, or type the ticket code below.</p>
            <button type="button" onClick={retry} className="h-10 rounded-full bg-white px-5 text-sm font-medium text-ink">
              Try again
            </button>
          </div>
        )}

        {result && (
          <div
            role="status"
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white ${
              result.kind === "ok" ? "bg-emerald-600" : result.kind === "already" ? "bg-amber-500" : "bg-rose-600"
            }`}
          >
            <p className="text-sm font-bold tracking-[0.18em]">
              {result.kind === "ok" ? "CHECKED IN" : result.kind === "already" ? "ALREADY CHECKED IN" : "NOT A VALID TICKET"}
            </p>
            {result.kind === "invalid" ? (
              <p className="text-lg">{result.code || "Unreadable code"}</p>
            ) : (
              <>
                <p className="text-3xl leading-tight font-bold">{result.ticket.name}</p>
                <p className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="rounded-full bg-white/25 px-3 py-1 font-semibold">{tierName(result.ticket.tier)}</span>
                  <span className="font-mono">{result.ticket.code}</span>
                </p>
                {merchLine(result.ticket) && <p className="text-base font-semibold">Give: {merchLine(result.ticket)}</p>}
                {result.kind === "already" && result.ticket.checkedInAt && (
                  <p className="text-sm">
                    First checked in at {time(result.ticket.checkedInAt)}
                    {result.ticket.checkedInBy ? ` by ${result.ticket.checkedInBy.split("@")[0]}` : ""}
                  </p>
                )}
              </>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearTimeout(resume.current);
                  setResult(null);
                }}
                className="h-11 rounded-full bg-white px-6 text-sm font-bold text-ink"
              >
                Next
              </button>
              {result.kind === "ok" && (
                <button type="button" onClick={() => undo(result.ticket.id)} className="h-11 rounded-full border border-white/60 px-5 text-sm font-semibold">
                  Undo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Type a code */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) run(code);
          setCode("");
        }}
        className="flex gap-2"
      >
        <label htmlFor="code" className="sr-only">
          Ticket code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ticket code, e.g. AB12-CD34"
          autoCapitalize="characters"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-4 font-mono text-base uppercase outline-none placeholder:font-sans placeholder:normal-case focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
        />
        <button type="submit" disabled={busy} className="h-12 rounded-full bg-ink px-5 text-sm font-semibold text-white disabled:opacity-60">
          Check in
        </button>
      </form>

      {/* Search */}
      <div className="flex flex-col gap-2">
        <label htmlFor="find" className="text-sm font-medium text-zinc-700">
          No QR? Find them by name or email
        </label>
        <input
          id="find"
          type="search"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="At least 3 letters"
          autoComplete="off"
          className="h-12 rounded-full border border-zinc-200 bg-white px-4 text-base outline-none focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
        />
        {matches && (
          <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80">
            {matches.length === 0 && <li className="px-4 py-3 text-sm text-zinc-500">No tickets match.</li>}
            {matches.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{t.name}</span>
                  <span className="text-xs text-zinc-500">
                    {tierName(t.tier)} · <span className="font-mono">{t.code}</span>
                  </span>
                </span>
                {t.checkedInAt ? (
                  <span className="shrink-0 text-xs font-medium text-emerald-700">In at {time(t.checkedInAt)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      run(t.code);
                      setMatches(null);
                      setQuery("");
                    }}
                    className="h-9 shrink-0 rounded-full bg-ink px-4 text-xs font-semibold text-white"
                  >
                    Check in
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

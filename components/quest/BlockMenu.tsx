"use client";

import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { blockAction } from "@/app/quest/actions";

/** Block or report, on every person card. Blocking hides both people from each other. */
export default function BlockMenu({ id, name, onDone }: { id: string; name: string; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (withReport: boolean) =>
    start(async () => {
      const res = await blockAction(id, withReport, withReport ? reason : "");
      setMsg(res?.message ?? null);
      if (res?.ok) setTimeout(() => onDone?.(), 900);
    });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Block or report ${name}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-fg/40 hover:bg-fg/[0.06] hover:text-fg/80"
      >
        <Flag aria-hidden className="size-4" />
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-fg/10 bg-bg p-3">
      {msg ? (
        <p role="status" className="text-sm font-bold">
          {msg}
        </p>
      ) : report ? (
        <>
          <label htmlFor={`reason-${id}`} className="text-xs font-bold text-fg/60">
            What happened? Organisers will review it.
          </label>
          <textarea
            id={`reason-${id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            className="resize-none rounded-xl border border-fg/10 bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-h-yellow"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => submit(true)}
              className="min-h-10 flex-1 rounded-full bg-g-red px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              Block and report
            </button>
            <button type="button" onClick={() => setOpen(false)} className="min-h-10 rounded-full px-4 text-sm font-bold text-fg/60">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(false)}
            className="min-h-10 rounded-full border border-fg/15 px-4 text-sm font-bold disabled:opacity-50"
          >
            Block {name}
          </button>
          <button type="button" onClick={() => setReport(true)} className="min-h-10 rounded-full border border-g-red/50 px-4 text-sm font-bold text-bad">
            Report
          </button>
          <button type="button" onClick={() => setOpen(false)} className="min-h-10 rounded-full px-3 text-sm font-bold text-fg/50">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { blockAction } from "@/app/quest/actions";

/** Block, on every person card. Blocking hides both people from each other. Help goes to the organisers. */
export default function BlockMenu({ id, name, onDone }: { id: string; name: string; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const block = () =>
    start(async () => {
      const res = await blockAction(id);
      setMsg(res?.message ?? null);
      if (res?.ok) setTimeout(() => onDone?.(), 900);
    });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`More options for ${name}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-fg/40 hover:bg-fg/[0.06] hover:text-fg/80"
      >
        <Ellipsis aria-hidden className="size-5" />
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-fg/10 bg-bg p-3">
      {msg ? (
        <p role="status" className="text-sm font-bold">
          {msg}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={block}
            className="min-h-11 rounded-full border border-fg/15 px-4 text-sm font-bold disabled:opacity-50"
          >
            Block {name}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full px-3 text-sm font-bold text-fg/50">
            Cancel
          </button>
        </div>
      )}
      <Link href="/quest/people?role=organisers" className="flex min-h-11 items-center text-xs font-bold text-hl underline">
        Need help? Find an organiser
      </Link>
    </div>
  );
}

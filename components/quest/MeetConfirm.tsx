"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { meetAction } from "@/app/quest/actions";
import { POINTS } from "@/lib/quest/config";
import { pillDark } from "./ui";

export default function MeetConfirm({ token, name }: { token: string; name: string }) {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<Awaited<ReturnType<typeof meetAction>> | null>(null);

  if (res?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <div role="status" className="relative flex flex-col items-center gap-1 overflow-hidden rounded-[28px] bg-p-green p-8 text-center">
          <span aria-hidden className="absolute top-4 left-6 size-4 rounded-full bg-g-blue" />
          <span aria-hidden className="absolute top-10 right-8 h-3 w-8 rotate-12 rounded-full bg-g-red" />
          <span aria-hidden className="absolute bottom-6 left-10 size-3 rotate-45 rounded-sm bg-g-yellow" />
          <span aria-hidden className="absolute right-12 bottom-10 size-3.5 rounded-full bg-g-green" />
          <span aria-hidden className="absolute top-20 left-4 size-2.5 rounded-full bg-h-red" />
          <span className="type-heading text-6xl font-bold">{res.fresh ? `+${POINTS.meet}` : "✓"}</span>
          <span className="type-heading text-2xl font-bold">You met {res.name}</span>
          <span className="text-sm leading-normal text-[#1E3A24]">
            {res.fresh ? "You're connected now. Their shared contacts are in your crew." : "You two already met. Each pair scores once."}
          </span>
        </div>
        <Link href="/quest/event" className={`${pillDark} min-h-14 text-base`}>
          Back to my QR
        </Link>
        <Link href="/quest/crew" className="flex min-h-11 items-center justify-center text-sm font-semibold">
          Open my crew
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {res && !res.ok && (
        <p role="alert" className="rounded-2xl bg-p-red px-4 py-3 text-sm font-semibold">
          {res.message}
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setRes(await meetAction(token)))}
        className={`${pillDark} min-h-14 text-base`}
      >
        {pending ? "Checking…" : `I'm with ${name} now`}
      </button>
      <Link href="/quest/event" className="flex min-h-11 items-center justify-center text-sm font-semibold">
        Cancel
      </Link>
    </div>
  );
}

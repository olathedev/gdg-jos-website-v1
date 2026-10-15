"use client";

import { Loading03Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { useActionState } from "react";
import type { ActionState } from "@/app/admin-internal/actions";
import { communityImportAction, reviewReportAction } from "@/app/admin-internal/quest/actions";
import Icon from "./Icon";

export function CommunityImport() {
  const [state, action, pending] = useActionState<ActionState, FormData>(communityImportAction, null);
  return (
    <form action={action} className="max-w-xl space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">Member export (CSV)</span>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv,text/plain"
          className="block w-full text-sm text-zinc-600 file:mr-3 file:h-9 file:rounded-full file:border-0 file:bg-zinc-100 file:px-4 file:text-sm file:font-medium hover:file:bg-zinc-200"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">
          Or paste emails <span className="font-normal text-zinc-400">(any separator)</span>
        </span>
        <textarea
          name="emails"
          rows={3}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
          placeholder="ada@example.com, tolu@example.com"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-60"
        >
          <Icon icon={pending ? Loading03Icon : Upload04Icon} className={`size-4 ${pending ? "animate-spin" : ""}`} />
          Match members
        </button>
        {state && (
          <span role="status" className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}

export function ReviewButton({ blocker, blocked }: { blocker: string; blocked: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(reviewReportAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="blocker" value={blocker} />
      <input type="hidden" name="blocked" value={blocked} />
      <button
        type="submit"
        disabled={pending || Boolean(state?.ok)}
        className="inline-flex h-8 items-center rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
      >
        {state?.ok ? "Reviewed" : "Mark reviewed"}
      </button>
    </form>
  );
}

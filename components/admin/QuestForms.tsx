"use client";

import { Loading03Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { useActionState } from "react";
import type { ActionState } from "@/app/admin-internal/actions";
import {
  addPartnerAction,
  addQuestionAction,
  communityImportAction,
  removePartnerAction,
  removeQuestionAction,
  reviewReportAction,
  roundAction,
} from "@/app/admin-internal/quest/actions";
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

export function RoundButton({ round, op, label }: { round: number; op: "open" | "close"; label: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(roundAction, null);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="round" value={round} />
      <input type="hidden" name="op" value={op} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium disabled:opacity-60 ${
          op === "open" ? "bg-ink text-white hover:bg-ink/85" : "border border-zinc-200 bg-white hover:bg-zinc-50"
        }`}
      >
        {pending ? "…" : label}
      </button>
      {state && !state.ok && <span className="text-xs text-rose-600">{state.message}</span>}
    </form>
  );
}

export function AddPartner() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addPartnerAction, null);
  return (
    <form action={action} className="flex max-w-xl flex-wrap items-center gap-3">
      <input
        name="name"
        required
        maxLength={60}
        placeholder="Partner name"
        className="h-10 min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-4 text-sm outline-none hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-60"
      >
        Add partner
      </button>
      {state && (
        <span role="status" className={`w-full text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}

export function RemovePartner({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(removePartnerAction, null);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs font-medium text-zinc-500 hover:text-rose-600 disabled:opacity-60">
        Remove
      </button>
      {state && !state.ok && <span className="max-w-40 text-right text-xs text-rose-600">{state.message}</span>}
    </form>
  );
}

const field =
  "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100";

/** Add a custom question to a Brain Blitz round. Radios, not selects. */
export function AddQuestion() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addQuestionAction, null);
  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-2xl border border-zinc-200/80 p-4">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 text-sm font-medium text-zinc-700">Round</legend>
        {[1, 2, 3].map((r) => (
          <label key={r} className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-zinc-200 px-3.5 text-sm has-checked:border-ink has-checked:bg-ink has-checked:text-white">
            <input type="radio" name="round" value={r} defaultChecked={r === 1} className="sr-only" />
            Round {r}
          </label>
        ))}
      </fieldset>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">Question</span>
        <input name="question" required maxLength={200} className={field} placeholder="What did the speaker say Gemini can call to act for you?" />
      </label>
      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium text-zinc-700">
          Answers <span className="font-normal text-zinc-400">(tick the right one)</span>
        </legend>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <input type="radio" name="correct" value={i} defaultChecked={i === 0} aria-label={`Answer ${i + 1} is correct`} className="size-4 accent-emerald-600" />
            <input name={`option${i}`} required maxLength={120} className={field} placeholder={`Answer ${i + 1}`} aria-label={`Answer ${i + 1}`} />
          </div>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-60"
        >
          Add question
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

export function RemoveQuestion({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(removeQuestionAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending || Boolean(state?.ok)} className="text-xs font-medium text-zinc-500 hover:text-rose-600 disabled:opacity-60">
        {state?.ok ? "Removed" : "Remove"}
      </button>
    </form>
  );
}

"use client";

import { Loading03Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin-internal/actions";
import {
  addPartnerAction,
  addQuestionAction,
  partnersOpenAction,
  communityImportAction,
  removePartnerAction,
  removeQuestionAction,
  resetPartnerCodeAction,
  reviewReportAction,
  roundAction,
  updatePartnerAction,
} from "@/app/admin-internal/quest/actions";
import type { AdminPartner } from "@/lib/quest/admin";
import { PARTNER_SOCIALS } from "@/lib/quest/validate";
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

/** Partner profile: what players see on the partner's page. Handles only; the app builds the links. */
export function EditPartner({ partner }: { partner: AdminPartner }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePartnerAction, null);
  const [description, setDescription] = useState(partner.description ?? "");
  const input =
    "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100";
  const label = "mb-1 block text-xs font-medium text-zinc-600";
  return (
    <form action={action} className="mt-3 space-y-3 border-t border-zinc-100 pt-3 text-sm">
      <input type="hidden" name="id" value={partner.id} />
      <label className="block">
        <span className={label}>
          Description <span className="text-zinc-400">({description.length}/280)</span>
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={280}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
        />
      </label>
      <label className="block">
        <span className={label}>Website</span>
        <input name="website_url" type="url" defaultValue={partner.website_url ?? ""} placeholder="https://…" className={input} />
      </label>
      <label className="block">
        <span className={label}>Logo image link</span>
        <input name="logo_url" type="url" defaultValue={partner.logo_url ?? ""} placeholder="https://…/logo.png" className={input} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PARTNER_SOCIALS.map((s) => (
          <label key={s.id} className="block">
            <span className={label}>{s.id === "linkedin" ? "LinkedIn page slug" : s.name}</span>
            <input name={s.id} defaultValue={partner[s.id] ?? ""} placeholder="handle" autoComplete="off" className={input} />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="block w-24">
          <span className={label}>Order</span>
          <input name="sort_order" type="number" inputMode="numeric" defaultValue={partner.sort_order} className={input} />
        </label>
        <label className="flex h-10 items-center gap-2">
          <input name="active" type="checkbox" defaultChecked={partner.active} className="size-4 accent-ink" />
          <span>Shown to players</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
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

/** Issues a new booth code. Printed QRs for this partner stop working, so it asks first. */
export function ResetPartnerCode({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(resetPartnerCodeAction, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Reset ${name}'s booth QR? Codes already printed for this partner will stop working.`)) e.preventDefault();
      }}
      className="flex flex-col gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="self-start text-xs font-medium text-zinc-500 hover:text-rose-600 disabled:opacity-60">
        Reset booth QR
      </button>
      {state && <span className={`text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</span>}
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

/** Opens or closes Partner Link-up for every player. */
export function PartnersSwitch({ open }: { open: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(partnersOpenAction, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/80 px-4 py-3">
      <span className="flex items-center gap-2.5 text-sm">
        <span aria-hidden className={`size-2 rounded-full ${open ? "bg-emerald-500" : "bg-zinc-300"}`} />
        Partner Link-up is <span className="font-medium">{open ? "open" : "closed"}</span> for players
      </span>
      <input type="hidden" name="open" value={open ? "0" : "1"} />
      <button
        type="submit"
        disabled={pending}
        className={`ml-auto inline-flex h-9 items-center rounded-full px-4 text-sm font-medium disabled:opacity-60 ${
          open ? "border border-zinc-200 bg-white hover:bg-zinc-50" : "bg-ink text-white hover:bg-ink/85"
        }`}
      >
        {pending ? "…" : open ? "Close Partner Link-up" : "Open Partner Link-up"}
      </button>
      {state && !state.ok && <span className="w-full text-xs text-rose-600">{state.message}</span>}
    </form>
  );
}

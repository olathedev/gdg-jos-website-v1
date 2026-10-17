"use client";

import { useActionState, useState, useTransition } from "react";
import { createInviteAction, type InviteResult, revokeInviteAction } from "@/app/c/actions";
import { roleLabel, type StaffRole } from "@/lib/quest/roles";
import ShareProfile from "./ShareProfile";
import { gameBtn } from "./ui";

const field =
  "h-12 w-full rounded-2xl border border-fg/[0.12] bg-surface px-4 text-base text-fg outline-none placeholder:text-fg/30 focus:border-h-yellow";
const label = "text-[11px] font-bold tracking-[0.2em] text-fg/50";

/** Create a role invite link. The full link is shown once, right here, with share options and a QR. */
export function CreateInvite({ slug, circleName, roles }: { slug: string; circleName: string; roles: StaffRole[] }) {
  const [state, action, pending] = useActionState<InviteResult, FormData>(createInviteAction.bind(null, slug), null);
  const [role, setRole] = useState<StaffRole>(roles[0]);
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4 rounded-[24px] border border-fg/[0.08] bg-surface p-4">
        <fieldset className="flex flex-col gap-2">
          <legend className={`${label} mb-2`}>ROLE</legend>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <label key={r} className={`flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-bold ${role === r ? "border-fg bg-fg text-on-fg" : "border-fg/20"}`}>
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                {roleLabel(r)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className={label}>USES (1–50)</span>
            <input name="uses" type="number" inputMode="numeric" min={1} max={50} defaultValue={1} required className={field} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={label}>EXPIRES IN (DAYS, 1–30)</span>
            <input name="days" type="number" inputMode="numeric" min={1} max={30} defaultValue={7} required className={field} />
          </label>
        </div>
        <label className="flex flex-col gap-2">
          <span className={label}>PRIVATE NOTE (OPTIONAL)</span>
          <input name="note" maxLength={120} placeholder="e.g. Flutter talk speakers" className={field} />
        </label>
        <button type="submit" disabled={pending} className={gameBtn}>
          {pending ? "Creating…" : `Create ${roleLabel(role)} link`}
        </button>
      </form>

      {state && !state.ok && (
        <p role="alert" className="rounded-full border border-g-red/40 bg-g-red/10 px-4 py-2.5 text-center text-sm font-bold text-bad">
          {state.message}
        </p>
      )}
      {state?.ok && state.url && (
        <section className="flex flex-col items-center gap-3 rounded-[24px] border border-g-green/40 bg-g-green/10 p-4 text-center" aria-live="polite">
          <p className="text-sm font-bold text-good">{state.message}</p>
          <ShareProfile url={state.url} name={circleName} text={`You're invited to ${circleName} on PadiUp:`} />
          {state.qr && (
            // eslint-disable-next-line @next/next/no-img-element -- generated data URL
            <img src={state.qr} alt="QR code for the invite link" width={200} height={200} className="rounded-xl bg-white p-2" />
          )}
        </section>
      )}
    </div>
  );
}

export function RevokeInvite({ slug, id }: { slug: string; id: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className="min-h-11 rounded-full border border-g-red/40 px-4 text-sm font-bold text-bad hover:bg-g-red/10 disabled:opacity-50"
        onClick={() => {
          if (!window.confirm("Revoke this link? It stops working straight away.")) return;
          start(async () => setMessage((await revokeInviteAction(slug, id))?.message ?? ""));
        }}
      >
        {pending ? "Revoking…" : "Revoke"}
      </button>
      {message && <span className="text-xs font-bold text-fg/70">{message}</span>}
    </span>
  );
}

"use client";

import { useState, useTransition } from "react";
import { changeRoleAction } from "@/app/c/actions";
import { roleLabel, type Role } from "@/lib/quest/roles";

/**
 * Change someone's role: pick one of the roles you may give, then confirm.
 * The list comes from the server (assignableRoles) and the server checks again on save.
 */
export default function RoleControl({
  slug,
  userId,
  name,
  current,
  options,
  locked,
}: {
  slug: string;
  userId: string;
  name: string;
  current: Role;
  options: Role[];
  /** Why this role can't be changed here, if it can't. */
  locked?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<Role | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const choices = options.filter((r) => r !== current);

  if (locked || !choices.length) return <span className="text-xs text-fg/45">{locked ?? "You can't change this role"}</span>;

  const btn = "min-h-11 rounded-full border px-3.5 text-sm font-bold transition-colors disabled:opacity-50";
  return (
    <div className="flex flex-col gap-2">
      {!open ? (
        <button type="button" className={`${btn} self-start border-fg/20 hover:bg-fg/[0.06]`} onClick={() => setOpen(true)} aria-label={`Change ${name}'s role`}>
          Change role
        </button>
      ) : pick ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-fg/15 p-3">
          <p className="text-sm font-bold">
            Make {name} {pick === "attendee" ? "an attendee" : `a ${roleLabel(pick)}`}?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              className={`${btn} flex-1 border-fg bg-fg text-on-fg`}
              onClick={() =>
                start(async () => {
                  const res = await changeRoleAction(slug, userId, pick);
                  setMessage(res ? { ok: res.ok, text: res.message } : null);
                  setPick(null);
                  setOpen(false);
                })
              }
            >
              {pending ? "Saving…" : "Yes, change it"}
            </button>
            <button type="button" disabled={pending} className={`${btn} flex-1 border-fg/20`} onClick={() => setPick(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div role="group" aria-label={`New role for ${name}`} className="flex flex-wrap gap-2">
          {choices.map((r) => (
            <button key={r} type="button" className={`${btn} border-fg/20 hover:bg-fg/[0.06]`} onClick={() => setPick(r)}>
              {roleLabel(r)}
            </button>
          ))}
          <button type="button" className={`${btn} border-transparent text-fg/60`} onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      )}
      {message && (
        <p role="status" className={`text-xs font-bold ${message.ok ? "text-good" : "text-bad"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

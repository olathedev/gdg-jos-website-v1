"use client";

import { Copy01Icon, Loading03Icon, Tick02Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useActionState, useState } from "react";
import { acceptInviteAction, inviteAction, reissueAction, removeAction, type ActionState, type InviteState } from "@/app/admin-internal/actions";
import Dropdown from "./Dropdown";
import Icon from "./Icon";

const field =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-base outline-none sm:text-[15px] placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100";

const roleNames: Record<string, string> = { superadmin: "Super admin", admin: "Admin", volunteer: "Volunteer" };

function LinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 pl-3.5">
      <code className="min-w-0 flex-1 truncate text-xs text-zinc-700">{link}</code>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(link).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-medium text-white hover:bg-ink/85"
      >
        <Icon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" /> {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

export function InviteForm({ roles }: { roles: string[] }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteAction, null);
  const [role, setRole] = useState(roles.includes("admin") ? "admin" : roles[0]);
  return (
    <form action={action} className="rounded-2xl border border-zinc-200 p-5 sm:p-6">
      <h2 className="font-semibold">Add a team member</h2>
      <p className="mt-1 text-sm text-zinc-500">They get a one-time link to set their password.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.3fr_auto_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">Name</span>
          <input name="name" placeholder="Ada Lovelace" autoComplete="off" className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">Email</span>
          <input name="email" type="email" required placeholder="ada@example.com" autoComplete="off" className={field} />
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">Role</span>
          <input type="hidden" name="role" value={role} />
          <Dropdown label="Role" value={role} onChange={setRole} options={roles.map((r) => ({ value: r, label: roleNames[r] }))} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-70"
        >
          <Icon icon={pending ? Loading03Icon : UserAdd01Icon} className={`size-4 ${pending ? "animate-spin" : ""}`} /> Create invite
        </button>
      </div>
      <div aria-live="polite">
        {state && (
          <div className="mt-4">
            <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>{state.message}</p>
            {state.link && <LinkBox link={state.link} />}
          </div>
        )}
      </div>
    </form>
  );
}

export function ReissueButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(reissueAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="h-8 rounded-full border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60">
        {pending ? "…" : "New link"}
      </button>
      {state?.link && <LinkBox link={state.link} />}
      {state && !state.ok && <p className="mt-1 text-xs text-rose-600">{state.message}</p>}
    </form>
  );
}

export function RemoveButton({ id, email }: { id: string; email: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(removeAction, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Remove ${email}? They lose access immediately.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="h-8 rounded-full px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60">
        Remove
      </button>
      {state && !state.ok && <p className="mt-1 text-xs text-rose-600">{state.message}</p>}
    </form>
  );
}

export function AcceptInviteForm({ token, loginHref, email }: { token: string; loginHref: string; email: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(acceptInviteAction, null);
  if (state?.ok) {
    return (
      <div className="text-center">
        <p className="text-emerald-700">You&apos;re all set.</p>
        <Link href={loginHref} className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-white hover:bg-ink/85">
          Go to sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="email" name="email" value={email} readOnly autoComplete="username" className="sr-only" tabIndex={-1} aria-hidden />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">New password</span>
        <input name="password" type="password" required minLength={10} maxLength={200} autoComplete="new-password" className={field} />
        <span className="mt-1.5 block text-xs text-zinc-400">At least 10 characters.</span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">Confirm password</span>
        <input name="confirm" type="password" required minLength={10} maxLength={200} autoComplete="new-password" className={field} />
      </label>
      {state && !state.ok && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white hover:bg-ink/85 disabled:opacity-70">
        {pending && <Icon icon={Loading03Icon} className="size-4 animate-spin" />} Set password
      </button>
    </form>
  );
}

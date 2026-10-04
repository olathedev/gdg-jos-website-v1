"use client";

import { Loading03Icon, LockIcon } from "@hugeicons/core-free-icons";
import Icon from "./Icon";
import { useActionState } from "react";
import { checkInAction, loginAction, recheckAction, resendAction, type ActionState } from "@/app/admin-internal/actions";

const field =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={field} />
      </div>
      <div>
        <label htmlFor="pin" className="mb-1.5 block text-sm font-medium text-zinc-700">
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          required
          inputMode="numeric"
          pattern="\d{6,12}"
          minLength={6}
          maxLength={12}
          autoComplete="current-password"
          className={`${field} tracking-[0.3em]`}
        />
      </div>
      {state && !state.ok && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 ring-1 ring-rose-600/15 ring-inset">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:opacity-70"
      >
        <Icon icon={pending ? Loading03Icon : LockIcon} className={`size-4 ${pending ? "animate-spin" : ""}`} />
        Sign in
      </button>
    </form>
  );
}

const actions = { recheck: recheckAction, resend: resendAction, checkin: checkInAction };

/** Small inline action button; shows the result next to it. */
export function ActionButton({
  kind,
  fields,
  label,
  tone = "default",
}: {
  kind: keyof typeof actions;
  fields: Record<string, string>;
  label: string;
  tone?: "default" | "primary" | "quiet";
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(actions[kind], null);
  const cls = {
    default: "border border-zinc-200 bg-white hover:bg-zinc-50",
    primary: "bg-ink text-white hover:bg-ink/85",
    quiet: "text-zinc-500 hover:bg-zinc-100 hover:text-ink",
  }[tone];
  return (
    <form action={action} className="inline-flex items-center gap-2">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-60 ${cls}`}
      >
        {pending && <Icon icon={Loading03Icon} className="size-3.5 animate-spin" />}
        {label}
      </button>
      {state && (
        <span role="status" className={`text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}

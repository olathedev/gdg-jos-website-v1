"use client";

import { Loader2, Lock } from "lucide-react";
import { useActionState } from "react";
import { checkInAction, loginAction, recheckAction, resendAction, type ActionState } from "@/app/admin-internal/actions";

const field =
  "h-12 w-full rounded-xl bg-paper/60 px-4 text-base ring-1 ring-ink/10 outline-none ring-inset placeholder:text-ink/40 focus:bg-white focus:ring-2 focus:ring-g-blue";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={field} />
      </div>
      <div>
        <label htmlFor="pin" className="mb-1.5 block text-sm font-medium">
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
        <p role="alert" className="rounded-xl bg-p-red px-4 py-3 text-sm font-medium text-[#a50e0e]">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:opacity-70"
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Lock aria-hidden className="size-4" />}
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
    default: "bg-white ring-1 ring-ink/15 hover:bg-ink hover:text-white",
    primary: "bg-ink text-white hover:bg-ink/85",
    quiet: "text-ink/60 underline underline-offset-4 hover:text-ink",
  }[tone];
  return (
    <form action={action} className="inline-flex items-center gap-2">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-60 ${cls}`}
      >
        {pending && <Loader2 aria-hidden className="size-3 animate-spin" />}
        {label}
      </button>
      {state && (
        <span role="status" className={`text-xs ${state.ok ? "text-[#188038]" : "text-[#a50e0e]"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}

"use client";

import { Loading03Icon, Search01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { useActionState, useState } from "react";
import { findTicketsAction, sendTicketAction, type FindState, type MailState } from "@/app/admin-internal/mail/actions";
import type { FoundTicket } from "@/lib/admin/mail";
import Icon from "./Icon";

const tierPill: Record<string, string> = {
  vip: "bg-blue-600 text-white",
  padi: "bg-emerald-700 text-white",
  regular: "bg-zinc-700 text-white",
};
const tierLabel: Record<string, string> = { vip: "VIP", padi: "My Padi", regular: "Regular" };

function TicketRow({ t }: { t: FoundTicket }) {
  const [elsewhere, setElsewhere] = useState(false);
  const [state, action, pending] = useActionState<MailState, FormData>(sendTicketAction, null);
  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {t.holder_name}
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${tierPill[t.tier] ?? tierPill.regular}`}>{tierLabel[t.tier] ?? t.tier}</span>
          </p>
          <p className="truncate text-sm text-zinc-500">{t.holder_email}</p>
          <p className="mt-0.5 font-mono text-xs tracking-wider text-zinc-400">
            {t.code} · {t.reference}
          </p>
        </div>
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="ticketId" value={t.id} />
          {elsewhere && (
            <input
              name="to"
              type="email"
              required
              autoFocus
              placeholder="another@email.com"
              aria-label="Send to"
              className="h-9 w-56 rounded-full border border-zinc-200 px-3.5 text-sm outline-none focus:border-ink/30 focus:ring-4 focus:ring-zinc-100"
            />
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-medium whitespace-nowrap text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-60"
          >
            <Icon icon={pending ? Loading03Icon : SentIcon} className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
            {elsewhere ? "Send" : "Send to holder"}
          </button>
          <button
            type="button"
            onClick={() => setElsewhere((v) => !v)}
            className="h-9 rounded-full px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-ink"
          >
            {elsewhere ? "Cancel" : "Other email"}
          </button>
        </form>
      </div>
      {state && (
        <p role="status" className={`mt-2 text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {state.message}
        </p>
      )}
    </li>
  );
}

export default function TicketSender() {
  const [state, action, pending] = useActionState<FindState, FormData>(findTicketsAction, null);
  return (
    <div>
      <form action={action} className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-400">
            <Icon icon={Search01Icon} className="size-4" />
          </span>
          <input
            name="q"
            type="search"
            required
            minLength={3}
            defaultValue={state?.q}
            placeholder="Ticket code, email, name or order reference"
            aria-label="Find a ticket"
            className="h-11 w-full rounded-full border border-zinc-200 bg-white pr-4 pl-10 text-base outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100 sm:text-[15px]"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 px-5 text-[15px] font-medium hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-60"
        >
          {pending && <Icon icon={Loading03Icon} className="size-4 animate-spin" />}
          Find
        </button>
      </form>

      {state && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/80">
          {state.results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">No tickets match &ldquo;{state.q}&rdquo;.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {state.results.map((t) => (
                <TicketRow key={t.id} t={t} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

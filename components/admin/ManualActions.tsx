"use client";

import { Add01Icon, ArrowUpRight01Icon, Cancel01Icon, Download04Icon, Loading03Icon, Ticket02Icon } from "@hugeicons/core-free-icons";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import {
  editHolderAction,
  issueTicketsAction,
  markPaidAction,
  upgradeTicketAction,
  type ActionState,
  type IssueState,
} from "@/app/admin-internal/actions";
import { tierList, tiers, type TierId } from "@/lib/tickets/tiers";
import Dropdown from "./Dropdown";
import Icon from "./Icon";

const methodOptions = [
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Bank transfer" },
  { value: "pos", label: "POS" },
  { value: "complimentary", label: "Complimentary (free)" },
];

const tierDot: Record<TierId, string> = { vip: "bg-blue-600", padi: "bg-emerald-700", regular: "bg-zinc-700" };
const tierOptions = (list = tierList) =>
  list.map((t) => ({ value: t.id, label: `${t.name}${t.seatsPerUnit > 1 ? ` (${t.seatsPerUnit} people)` : ""}`, dot: tierDot[t.id] }));
const paidOptions = methodOptions.filter((m) => m.value !== "complimentary");

const field =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base outline-none sm:text-sm placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100";
const btn = "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-60";
const primary = `${btn} bg-ink text-white hover:bg-ink/85`;
const outline = `${btn} border border-zinc-200 bg-white hover:bg-zinc-50`;
const quiet = `${btn} text-zinc-500 hover:bg-zinc-100 hover:text-ink`;

const naira = (kobo: number) => String(kobo / 100);
export const pdfUrl = (reference: string, code?: string) => `/api/tickets/order/${reference}/pdf${code ? `?code=${encodeURIComponent(code)}` : ""}`;

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600">{text}</span>
      {children}
    </label>
  );
}

/** Labelled custom dropdown that submits with its form. */
function Pick({ text, name, value, options, onChange }: { text: string; name: string; value: string; options: { value: string; label: string; dot?: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <span aria-hidden className="mb-1 block text-xs font-medium text-zinc-600">
        {text}
      </span>
      <Dropdown variant="field" label={text} name={name} value={value} options={options} onChange={onChange} />
    </div>
  );
}

function Result({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <span role="status" className={`text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
      {state.message}
    </span>
  );
}

function Submit({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={pending} className={primary}>
      {pending && <Icon icon={Loading03Icon} className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- issue tickets (cash / transfer / comp) ---------- */

export function IssueTicketsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue"
      >
        <Icon icon={Add01Icon} className="size-4" /> Issue tickets
      </button>
      {open && <IssueDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

function IssueDrawer({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [round, setRound] = useState(0); // remounts the form for "Issue another"
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Issue tickets">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="font-semibold">Issue tickets</p>
            <p className="text-sm text-zinc-500">For cash, transfer or POS payments, or a free comp ticket.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-g-blue"
          >
            <Icon icon={Cancel01Icon} className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm sm:px-6">
          <IssueForm key={round} onAgain={() => setRound((r) => r + 1)} />
        </div>
      </div>
    </div>
  );
}

function IssueForm({ onAgain }: { onAgain: () => void }) {
  const [state, action, pending] = useActionState<IssueState, FormData>(issueTicketsAction, null);
  const [tier, setTier] = useState<TierId>("vip");
  const [method, setMethod] = useState("cash");
  const [units, setUnits] = useState(1);
  const [amount, setAmount] = useState(naira(tiers.vip.priceKobo));
  const seats = units * tiers[tier].seatsPerUnit;
  const comp = method === "complimentary";

  const reprice = (t: TierId, u: number) => setAmount(naira(tiers[t].priceKobo * u));

  if (state?.ok && state.reference) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-800">
          <p className="font-medium">{state.message}</p>
          <p className="mt-1 font-mono text-xs tracking-wider">{state.codes?.join(" · ")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={pdfUrl(state.reference)} className={primary}>
            <Icon icon={Download04Icon} className="size-3.5" /> Download PDF
          </a>
          <a href={`/tickets/order/${state.reference}`} target="_blank" rel="noopener noreferrer" className={outline}>
            View tickets <Icon icon={ArrowUpRight01Icon} className="size-3.5" />
          </a>
          <button type="button" onClick={onAgain} className={quiet}>
            Issue another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Pick
          text="Ticket"
          name="tier"
          value={tier}
          options={tierOptions()}
          onChange={(v) => {
            setTier(v as TierId);
            reprice(v as TierId, units);
          }}
        />
        <Label text="Quantity">
          <input
            type="number"
            min={1}
            max={10}
            value={units}
            onChange={(e) => {
              const u = Math.min(10, Math.max(1, Number(e.target.value) || 1));
              setUnits(u);
              reprice(tier, u);
            }}
            className={field}
          />
        </Label>
        <Pick text="Paid by" name="method" value={method} options={methodOptions} onChange={setMethod} />
        <Label text="Amount paid (₦)">
          <input name="amount" inputMode="numeric" value={comp ? "0" : amount} disabled={comp} onChange={(e) => setAmount(e.target.value)} className={`${field} disabled:bg-zinc-50 disabled:text-zinc-400`} />
        </Label>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-semibold">Buyer</legend>
        <Label text="Full name">
          <input name="buyer_name" required minLength={2} maxLength={80} className={field} />
        </Label>
        <Label text="Email">
          <input name="buyer_email" type="email" required className={field} />
        </Label>
        <Label text="Phone (optional)">
          <input name="buyer_phone" type="tel" className={field} />
        </Label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Ticket holders</legend>
        <p className="text-xs text-zinc-500">Leave ticket 1 blank to put it in the buyer&apos;s name. Every ticket needs its own email.</p>
        {Array.from({ length: seats }, (_, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 rounded-xl border border-zinc-100 p-3">
            <span className="grid size-6 place-items-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">{i + 1}</span>
            <div className="space-y-2">
              <input name="attendee_name" placeholder={i === 0 ? "Name (same as buyer)" : "Name"} required={i > 0} aria-label={`Ticket ${i + 1} name`} className={field} />
              <input name="attendee_email" type="email" placeholder={i === 0 ? "Email (same as buyer)" : "Email"} required={i > 0} aria-label={`Ticket ${i + 1} email`} className={field} />
            </div>
          </div>
        ))}
      </fieldset>

      <Label text="Note (optional)">
        <input name="note" maxLength={300} placeholder="e.g. Paid at the registration desk" className={field} />
      </Label>

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
        <Icon icon={pending ? Loading03Icon : Ticket02Icon} className={`size-4 ${pending ? "animate-spin" : ""}`} />
        Issue {seats} ticket{seats === 1 ? "" : "s"}
      </button>
    </form>
  );
}

/* ---------- order drawer: mark a pending order paid ---------- */

export function MarkPaid({ reference }: { reference: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(markPaidAction, null);
  const [method, setMethod] = useState("transfer");
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className={outline}>
        Mark paid manually
      </button>
    );
  return (
    <form action={action} className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-zinc-100 p-3">
      <input type="hidden" name="reference" value={reference} />
      <div className="w-44">
        <Dropdown variant="field" label="Paid by" name="method" value={method} options={paidOptions} onChange={setMethod} />
      </div>
      <Submit pending={pending}>Confirm paid</Submit>
      <button type="button" onClick={() => setOpen(false)} className={quiet}>
        Cancel
      </button>
      <p className="w-full text-xs text-zinc-500">Only do this once you&apos;ve confirmed the money arrived. Tickets are issued straight away.</p>
      <Result state={state} />
    </form>
  );
}

/* ---------- order drawer: per-ticket tools ---------- */

type ToolTicket = { id: string; code: string; tier: TierId; holder_name: string; holder_email: string };

export function TicketTools({ reference, ticket }: { reference: string; ticket: ToolTicket }) {
  const [panel, setPanel] = useState<"upgrade" | "edit" | null>(null);
  const toggle = (p: "upgrade" | "edit") => setPanel((cur) => (cur === p ? null : p));
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1">
        <a href={pdfUrl(reference, ticket.code)} className={quiet}>
          <Icon icon={Download04Icon} className="size-3.5" /> Download
        </a>
        <button type="button" onClick={() => toggle("upgrade")} aria-expanded={panel === "upgrade"} className={quiet}>
          Change tier
        </button>
        <button type="button" onClick={() => toggle("edit")} aria-expanded={panel === "edit"} className={quiet}>
          Edit holder
        </button>
      </div>
      {panel === "upgrade" && <UpgradeForm ticket={ticket} onDone={() => setPanel(null)} />}
      {panel === "edit" && <EditForm ticket={ticket} />}
    </div>
  );
}

function UpgradeForm({ ticket, onDone }: { ticket: ToolTicket; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(upgradeTicketAction, null);
  const others = tierList.filter((t) => t.id !== ticket.tier);
  const [tier, setTier] = useState<TierId>(others.find((t) => t.priceKobo > tiers[ticket.tier].priceKobo)?.id ?? others[0].id);
  const [method, setMethod] = useState("cash");
  const diff = Math.max(0, tiers[tier].priceKobo / tiers[tier].seatsPerUnit - tiers[ticket.tier].priceKobo / tiers[ticket.tier].seatsPerUnit);
  const [amount, setAmount] = useState(naira(diff));
  const comp = method === "complimentary";
  useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(onDone, 1200);
      return () => clearTimeout(t);
    }
  }, [state, onDone]);

  return (
    <form action={action} className="mt-2 space-y-3 rounded-xl bg-zinc-50 p-3">
      <input type="hidden" name="ticketId" value={ticket.id} />
      <div className="grid grid-cols-2 gap-2">
        <Pick
          text={`From ${tiers[ticket.tier].name} to`}
          name="tier"
          value={tier}
          options={tierOptions(others)}
          onChange={(v) => {
            const t = v as TierId;
            setTier(t);
            setAmount(naira(Math.max(0, tiers[t].priceKobo / tiers[t].seatsPerUnit - tiers[ticket.tier].priceKobo / tiers[ticket.tier].seatsPerUnit)));
          }}
        />
        <Pick text="Paid by" name="method" value={method} options={methodOptions} onChange={setMethod} />
        <Label text="Extra collected (₦)">
          <input name="amount" inputMode="numeric" value={comp ? "0" : amount} disabled={comp} onChange={(e) => setAmount(e.target.value)} className={`${field} disabled:text-zinc-400`} />
        </Label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Submit pending={pending}>Change to {tiers[tier].name}</Submit>
        <Result state={state} />
      </div>
    </form>
  );
}

function EditForm({ ticket }: { ticket: ToolTicket }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(editHolderAction, null);
  return (
    <form action={action} className="mt-2 space-y-2 rounded-xl bg-zinc-50 p-3">
      <input type="hidden" name="ticketId" value={ticket.id} />
      <input name="name" defaultValue={ticket.holder_name} required minLength={2} maxLength={80} aria-label="Holder name" className={field} />
      <input name="email" type="email" defaultValue={ticket.holder_email} required aria-label="Holder email" className={field} />
      <div className="flex flex-wrap items-center gap-2">
        <Submit pending={pending}>Save</Submit>
        <Result state={state} />
      </div>
    </form>
  );
}

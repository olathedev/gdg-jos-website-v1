"use client";

import { Check, Loader2, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { checkoutSchema, fieldErrors, type CheckoutInput } from "@/lib/tickets/schema";
import { formatNaira, paidTiers, priceLabel, tierColor, tiers, type TierId } from "@/lib/tickets/tiers";
import TierArt from "./TierArt";

type Holder = { self: boolean; name: string; email: string };
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "paying" } | { kind: "error"; message: string } | { kind: "cancelled" };

const primaryBtn =
  "flex items-center justify-center gap-2 rounded-full bg-ink font-medium text-white transition-colors hover:bg-ink/85 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:cursor-wait disabled:opacity-70";

const emptyHolder = (self = false): Holder => ({ self, name: "", email: "" });

function resize(list: Holder[], n: number) {
  return Array.from({ length: n }, (_, i) => list[i] ?? emptyHolder(i === 0));
}

export default function CheckoutForm({ initialTier }: { initialTier: TierId }) {
  const router = useRouter();
  const [tierId, setTierId] = useState<TierId>(initialTier);
  const [units, setUnits] = useState(1);
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });
  const [holders, setHolders] = useState<Holder[]>(() => resize([], tiers[initialTier].seatsPerUnit));
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const tier = tiers[tierId];
  const seats = units * tier.seatsPerUnit;
  const total = tier.priceKobo * units;
  const busy = status.kind === "submitting" || status.kind === "paying";

  const chooseTier = (id: TierId) => {
    setTierId(id);
    setUnits(1);
    setHolders((h) => resize(h, tiers[id].seatsPerUnit));
    setErrors({});
  };

  const changeUnits = (n: number) => {
    const next = Math.min(tier.maxUnits, Math.max(1, n));
    setUnits(next);
    setHolders((h) => resize(h, next * tier.seatsPerUnit));
  };

  // Editing a field clears its error and any stale banner.
  const touch = (...keys: string[]) => {
    setErrors((e) => {
      if (!keys.some((k) => k in e)) return e;
      const next = { ...e };
      keys.forEach((k) => delete next[k]);
      return next;
    });
    setStatus((st) => (st.kind === "error" || st.kind === "cancelled" ? { kind: "idle" } : st));
  };

  const setBuyerField = (key: keyof typeof buyer, value: string) => {
    setBuyer((b) => ({ ...b, [key]: value }));
    touch(`buyer.${key}`);
  };

  const updateHolder = (i: number, patch: Partial<Holder>) => {
    setHolders((h) => h.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    touch(...Object.keys(patch).map((k) => `attendees.${i}.${k}`), "attendees");
  };

  const payload = useMemo<CheckoutInput>(
    () => ({
      tier: tierId as CheckoutInput["tier"], // the picker only offers paid tiers
      units,
      buyer,
      attendees: holders.map((h) => (h.self ? { name: buyer.name, email: buyer.email } : { name: h.name, email: h.email })),
      company,
    }),
    [tierId, units, buyer, holders, company],
  );

  // Map attendee errors back onto "self" ticket → buyer fields.
  const mapErrors = (e: Record<string, string>) => {
    const out = { ...e };
    holders.forEach((h, i) => {
      if (!h.self) return;
      for (const f of ["name", "email"] as const) {
        const k = `attendees.${i}.${f}`;
        if (out[k]) {
          out[`buyer.${f}`] ??= out[k];
          delete out[k];
        }
      }
    });
    return out;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(mapErrors(fieldErrors(parsed.error)));
      setStatus({ kind: "error", message: "Check the highlighted fields." });
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    setErrors({});
    setStatus({ kind: "submitting" });

    let data: { kind?: "free" | "paystack"; reference?: string; accessCode?: string; authorizationUrl?: string; error?: string; fields?: Record<string, string> };
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(mapErrors(data.fields));
        setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
        return;
      }
    } catch {
      setStatus({ kind: "error", message: "You seem to be offline. Check your connection and try again." });
      return;
    }

    const orderUrl = `/tickets/order/${encodeURIComponent(data.reference!)}`;
    if (data.kind === "free") {
      router.push(orderUrl);
      return;
    }

    setStatus({ kind: "paying" });
    try {
      const { default: PaystackPop } = await import("@paystack/inline-js");
      new PaystackPop().resumeTransaction(data.accessCode!, {
        onSuccess: () => router.push(orderUrl),
        onCancel: () => setStatus({ kind: "cancelled" }),
        // If the popup can't load (blockers, old browsers), fall back to Paystack's hosted page.
        onError: () => window.location.assign(data.authorizationUrl!),
      });
    } catch {
      window.location.assign(data.authorizationUrl!);
    }
  }

  const others = holders.map((h, i) => ({ h, i })).filter(({ h, i }) => !(i === 0 && h.self));
  const payLabel = total === 0 ? "Get my free ticket" : `Pay ${formatNaira(total)}`;

  const statusBox = (
    <div aria-live="polite">
      {status.kind === "error" && <p className="mt-4 rounded-xl bg-p-red px-4 py-3 text-sm font-medium text-[#a50e0e]">{status.message}</p>}
      {status.kind === "cancelled" && (
        <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink/80">Payment cancelled. Your details are still here, so you can try again.</p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-8">
      <div className="space-y-4 sm:space-y-5">
        {/* Ticket */}
        <Section title="Ticket">
          <fieldset>
            <legend className="sr-only">Ticket type</legend>
            <div className="space-y-2.5">
              {paidTiers.map((t) => {
                const active = t.id === tierId;
                return (
                  <label
                    key={t.id}
                    style={active ? { backgroundColor: tierColor[t.id] } : undefined}
                    className={`relative isolate flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-2xl px-4 py-3.5 transition-shadow has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-g-blue sm:px-5 sm:py-4 ${
                      active ? "ring-2 ring-ink" : "bg-white ring-1 ring-ink/12 hover:ring-ink/30"
                    }`}
                  >
                    {active && <TierArt tier={t.id} compact className="-z-10 opacity-50" />}
                    <input type="radio" name="tier" value={t.id} checked={active} onChange={() => chooseTier(t.id)} className="sr-only" />
                    <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-full ${active ? "bg-ink text-white" : "ring-2 ring-ink/20"}`}>
                      {active && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                        {t.name}
                        {t.badge && <span className="rounded-full bg-ink/[0.07] px-2 py-0.5 text-[11px] font-semibold">{t.badge}</span>}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[13px] text-ink/65">
                        {t.seatsPerUnit > 1 ? `${t.seatsPerUnit} people · ` : ""}
                        {t.perks.slice(1).join(" · ") || t.perks[0]}
                      </span>
                    </span>
                    <span className="type-heading shrink-0 text-xl sm:text-2xl">{priceLabel(t)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {tier.maxUnits > 1 && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
              <div>
                <p className="font-semibold" id="qty-label">
                  {tier.seatsPerUnit > 1 ? "Pairs" : "Tickets"}
                </p>
                <p className="text-[13px] text-ink/60">
                  {seats} {seats === 1 ? "person" : "people"} · max {tier.maxUnits}
                </p>
              </div>
              <div role="group" aria-labelledby="qty-label" className="flex items-center rounded-full bg-paper p-1">
                <StepButton label="Decrease" disabled={units <= 1 || busy} onClick={() => changeUnits(units - 1)}>
                  <Minus className="size-4" />
                </StepButton>
                <output aria-live="polite" className="w-8 text-center text-base font-semibold tabular-nums">
                  {units}
                </output>
                <StepButton label="Increase" disabled={units >= tier.maxUnits || busy} onClick={() => changeUnits(units + 1)}>
                  <Plus className="size-4" />
                </StepButton>
              </div>
            </div>
          )}
        </Section>

        {/* Buyer */}
        <Section title="Your details" hint="Your ticket and receipt go to this email.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors["buyer.name"]} className="sm:col-span-2">
              {(p) => <input {...p} autoComplete="name" value={buyer.name} onChange={(e) => setBuyerField("name", e.target.value)} />}
            </Field>
            <Field label="Email" error={errors["buyer.email"]}>
              {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" value={buyer.email} onChange={(e) => setBuyerField("email", e.target.value)} />}
            </Field>
            <Field label="Phone" error={errors["buyer.phone"]}>
              {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="080…" value={buyer.phone} onChange={(e) => setBuyerField("phone", e.target.value)} />}
            </Field>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={!holders[0]?.self}
              onChange={(e) => updateHolder(0, { self: !e.target.checked })}
              className="size-5 shrink-0 rounded accent-ink"
            />
            {seats === 1 ? "I'm buying this ticket for someone else" : "I'm not attending myself"}
          </label>
          {/* Honeypot: hidden from people and assistive tech. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
            <label>
              Company
              <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
          </div>
        </Section>

        {/* Other attendees: only when needed */}
        {others.length > 0 && (
          <Section title={others.length > 1 ? "Attendees" : "Attendee"} hint="Each person gets their own ticket by email.">
            {errors.attendees && <p className="mb-4 text-sm font-medium text-[#a50e0e]">{errors.attendees}</p>}
            <ol className="divide-y divide-ink/10">
              {others.map(({ h, i }) => (
                <li key={i} className="py-4 first:pt-0 last:pb-0">
                  <p className="mb-3 text-sm font-semibold text-ink/70">{holderLabel(tier.id, units, i, holders[0].self)}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" error={errors[`attendees.${i}.name`]}>
                      {(p) => <input {...p} autoComplete="off" value={h.name} onChange={(e) => updateHolder(i, { name: e.target.value })} />}
                    </Field>
                    <Field label="Email" error={errors[`attendees.${i}.email`]}>
                      {(p) => <input {...p} type="email" inputMode="email" autoComplete="off" value={h.email} onChange={(e) => updateHolder(i, { email: e.target.value })} />}
                    </Field>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Mobile status (desktop shows it in the summary) */}
        <div className="lg:hidden">{statusBox}</div>
        {total > 0 && (
          <p className="flex items-center justify-center gap-2 text-xs text-ink/55 lg:hidden">
            <ShieldCheck aria-hidden className="size-4 text-g-green" /> Payments secured by Paystack
          </p>
        )}
      </div>

      {/* Mobile: total + pay always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs text-ink/60">
              {tier.name} × {units}
              {tier.seatsPerUnit > 1 && ` · ${seats} people`}
            </p>
            <p className="type-heading text-2xl">{total === 0 ? "Free" : formatNaira(total)}</p>
          </div>
          <button type="submit" disabled={busy} className={`h-12 shrink-0 px-6 text-[15px] ${primaryBtn}`}>
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : total > 0 && <Lock aria-hidden className="size-4" />}
            {total === 0 ? "Get ticket" : "Pay now"}
          </button>
        </div>
      </div>

      {/* Desktop summary */}
      <aside className="hidden lg:sticky lg:top-28 lg:block">
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink/10">
          <div className="relative isolate p-6" style={{ backgroundColor: tierColor[tier.id] }}>
            <TierArt tier={tier.id} className="-z-10" />
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-ink/70">Order summary</p>
            <p className="type-heading mt-3 text-2xl">{tier.name}</p>
            <p className="mt-1 text-sm text-ink/70">
              {units} × {priceLabel(tier)}
              {tier.seatsPerUnit > 1 && ` · ${seats} people`}
            </p>
          </div>
          <div className="p-6">
            <ul className="space-y-2.5 text-sm">
              {tier.perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <Check aria-hidden className="size-4 shrink-0 text-g-green" strokeWidth={2.5} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-baseline justify-between border-t border-ink/10 pt-5">
              <span className="text-sm font-medium text-ink/70">Total</span>
              <span className="type-heading text-3xl">{total === 0 ? "Free" : formatNaira(total)}</span>
            </div>
            <button type="submit" disabled={busy} className={`mt-5 h-12 w-full text-[15px] ${primaryBtn}`}>
              {busy ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  {status.kind === "paying" ? "Opening secure checkout…" : "Processing…"}
                </>
              ) : (
                <>
                  {total > 0 && <Lock aria-hidden className="size-4" />} {payLabel}
                </>
              )}
            </button>
            {statusBox}
            {total > 0 && (
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink/55">
                <ShieldCheck aria-hidden className="size-4 text-g-green" /> Payments secured by Paystack
              </p>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}

function holderLabel(tier: TierId, units: number, i: number, buyerAttends: boolean) {
  if (tier === "padi") {
    if (units === 1) return i === 0 ? "Person 1" : buyerAttends ? "Your padi" : "Person 2";
    return `Pair ${Math.floor(i / 2) + 1} · Person ${(i % 2) + 1}`;
  }
  return `Ticket ${i + 1}`;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="relative rounded-3xl bg-white p-5 ring-1 ring-ink/[0.08] sm:p-7">
      <div className="mb-5">
        <h2 className="type-heading text-xl sm:text-2xl">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

type InputProps = { id: string; name: string; required: true; "aria-invalid": boolean; "aria-describedby"?: string; className: string };

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: (p: InputProps) => ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>
      {children({
        id,
        name: id,
        required: true,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? `${id}-err` : undefined,
        className: `h-12 w-full rounded-xl bg-paper/60 px-4 text-base text-ink ring-1 ring-inset transition-shadow outline-none placeholder:text-ink/40 focus:bg-white focus:ring-2 focus:ring-g-blue ${
          error ? "ring-g-red" : "ring-ink/10"
        }`,
      })}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-[#c5221f]">
          {error}
        </p>
      )}
    </div>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-30"
    >
      {children}
    </button>
  );
}

"use client";

import { Check, Loader2, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { checkoutSchema, fieldErrors, type CheckoutInput } from "@/lib/tickets/schema";
import { formatNaira, priceLabel, tierList, tiers, type TierId } from "@/lib/tickets/tiers";

type Holder = { self: boolean; name: string; email: string };
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "paying" } | { kind: "error"; message: string } | { kind: "cancelled" };

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
      tier: tierId,
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

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-8">
      <div className="space-y-6">
        {/* 1. Ticket */}
        <Panel step="1" title="Choose your ticket">
          <fieldset>
            <legend className="sr-only">Ticket type</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {tierList.map((t) => {
                const active = t.id === tierId;
                return (
                  <label
                    key={t.id}
                    className={`relative cursor-pointer rounded-2xl p-4 ring-2 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-g-blue ${
                      active ? "bg-ink text-white ring-ink" : "bg-white ring-ink/10 hover:ring-ink/30"
                    }`}
                  >
                    <input type="radio" name="tier" value={t.id} checked={active} onChange={() => chooseTier(t.id)} className="sr-only" />
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{t.name}</span>
                      <span aria-hidden className={`grid size-5 place-items-center rounded-full ${active ? "bg-g-blue" : "ring-1 ring-ink/25"}`}>
                        {active && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="type-condensed mt-3 block text-4xl">{priceLabel(t)}</span>
                    <span className={`mt-1 block text-xs ${active ? "text-white/70" : "text-ink/60"}`}>
                      {t.seatsPerUnit > 1 ? `${t.seatsPerUnit} people · ` : ""}
                      {t.perks.slice(1).join(" · ") || t.perks[0]}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {tier.maxUnits > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-paper px-5 py-4">
              <div>
                <p className="font-semibold" id="qty-label">
                  {tier.seatsPerUnit > 1 ? "How many pairs?" : "How many tickets?"}
                </p>
                <p className="text-sm text-ink/60">
                  {seats} {seats === 1 ? "person" : "people"} · up to {tier.maxUnits} per order
                </p>
              </div>
              <div role="group" aria-labelledby="qty-label" className="flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
                <StepButton label="Decrease" disabled={units <= 1 || busy} onClick={() => changeUnits(units - 1)}>
                  <Minus className="size-4" />
                </StepButton>
                <output aria-live="polite" className="w-8 text-center text-lg font-bold tabular-nums">
                  {units}
                </output>
                <StepButton label="Increase" disabled={units >= tier.maxUnits || busy} onClick={() => changeUnits(units + 1)}>
                  <Plus className="size-4" />
                </StepButton>
              </div>
            </div>
          )}
        </Panel>

        {/* 2. Buyer */}
        <Panel step="2" title="Your details" hint="We'll send the order confirmation here.">
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
          {/* Honeypot: hidden from people and assistive tech. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
            <label>
              Company
              <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
          </div>
        </Panel>

        {/* 3. Holders */}
        <Panel step="3" title={seats > 1 ? "Who's coming?" : "Who's this ticket for?"} hint="Each person gets their own ticket and QR code by email.">
          {errors.attendees && <p className="mb-4 text-sm font-medium text-g-red">{errors.attendees}</p>}
          <ol className="space-y-4">
            {holders.map((h, i) => (
              <li key={i} className="rounded-2xl bg-paper p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">
                    {holderLabel(tier.id, units, i)}
                  </p>
                  {i === 0 && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={h.self}
                        onChange={(e) => updateHolder(0, { self: e.target.checked })}
                        className="size-5 rounded accent-ink"
                      />
                      This one&apos;s for me
                    </label>
                  )}
                </div>
                {h.self ? (
                  <p className="mt-2 text-sm text-ink/60">{buyer.name || buyer.email ? `${buyer.name}${buyer.email ? ` · ${buyer.email}` : ""}` : "Uses your details above."}</p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" error={errors[`attendees.${i}.name`]}>
                      {(p) => <input {...p} autoComplete="off" value={h.name} onChange={(e) => updateHolder(i, { name: e.target.value })} />}
                    </Field>
                    <Field label="Email" error={errors[`attendees.${i}.email`]}>
                      {(p) => <input {...p} type="email" inputMode="email" autoComplete="off" value={h.email} onChange={(e) => updateHolder(i, { email: e.target.value })} />}
                    </Field>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Mobile: total + pay always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/60">
              {tier.name} × {units}
            </p>
            <p className="type-condensed text-3xl">{total === 0 ? "Free" : formatNaira(total)}</p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold tracking-wide text-ink uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:opacity-70"
          >
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : total > 0 && <Lock aria-hidden className="size-4" />}
            {total === 0 ? "Get ticket" : "Pay now"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28">
        <div className="rounded-[2rem] bg-ink p-6 text-white sm:p-8">
          <h2 className="font-mono text-xs tracking-[0.18em] text-white/60 uppercase">Order summary</h2>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="type-heading text-2xl">{tier.name}</p>
              <p className="mt-1 text-sm text-white/70">
                {units} × {priceLabel(tier)}
                {tier.seatsPerUnit > 1 && ` · ${seats} people`}
              </p>
            </div>
            <p className="type-condensed text-4xl">{total === 0 ? "Free" : formatNaira(total)}</p>
          </div>
          <ul className="mt-6 space-y-2 border-t border-white/15 pt-6 text-sm text-white/80">
            {tier.perks.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check aria-hidden className="size-4 text-h-green" /> {p}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-white/15 pt-6">
            <span className="font-semibold">Total</span>
            <span className="type-condensed text-5xl">{total === 0 ? "₦0" : formatNaira(total)}</span>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold tracking-wide text-ink uppercase transition-colors hover:bg-h-yellow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {status.kind === "paying" ? "Opening secure checkout…" : "Processing…"}
              </>
            ) : total === 0 ? (
              "Get my free ticket"
            ) : (
              <>
                <Lock aria-hidden className="size-4" /> Pay {formatNaira(total)}
              </>
            )}
          </button>

          <div aria-live="polite" className="min-h-0">
            {status.kind === "error" && <p className="mt-4 rounded-xl bg-g-red/15 px-4 py-3 text-sm text-p-red">{status.message}</p>}
            {status.kind === "cancelled" && (
              <p className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/85">Payment cancelled. Your details are still here, so you can try again.</p>
            )}
          </div>

          {total > 0 && (
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/60">
              <ShieldCheck aria-hidden className="size-4 text-h-green" /> Secured by Paystack
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}

function holderLabel(tier: TierId, units: number, i: number) {
  if (tier !== "padi") return `Ticket ${i + 1}`;
  if (units === 1) return i === 0 ? "You" : "Your padi";
  return `Pair ${Math.floor(i / 2) + 1} · Person ${(i % 2) + 1}`;
}

function Panel({ step, title, hint, children }: { step: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="relative rounded-[2rem] bg-white p-5 ring-1 ring-ink/10 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-mono text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="type-heading text-2xl">{title}</h2>
          {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
        </div>
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        name: id,
        required: true,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? `${id}-err` : undefined,
        className: `h-12 w-full rounded-xl bg-white px-4 text-base text-ink ring-1 ring-inset transition-shadow outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-g-blue ${
          error ? "ring-g-red" : "ring-ink/15"
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
      className="grid size-10 place-items-center rounded-full transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-g-blue disabled:opacity-30"
    >
      {children}
    </button>
  );
}

"use client";

import { Check, Loader2, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { checkoutSchema, fieldErrors, type CheckoutInput } from "@/lib/tickets/schema";
import { formatNaira, priceLabel, tierColor, tierList, tiers, type TierId } from "@/lib/tickets/tiers";
import TierArt from "./TierArt";

type Holder = { self: boolean; name: string; email: string };
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "paying" } | { kind: "error"; message: string } | { kind: "cancelled" };

// DevFest "sticker" button: yellow, ink outline, offset shadow that presses in.
const primaryBtn =
  "flex items-center justify-center gap-2 rounded-full bg-h-yellow font-bold tracking-wide text-ink uppercase ring-2 ring-ink shadow-[0_4px_0_0_var(--color-ink)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--color-ink)] active:translate-y-1 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0";

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
        <Panel step="1" tone="bg-p-blue" title="Choose your ticket">
          <fieldset>
            <legend className="sr-only">Ticket type</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {tierList.map((t) => {
                const active = t.id === tierId;
                return (
                  <label
                    key={t.id}
                    style={active ? { backgroundColor: tierColor[t.id] } : undefined}
                    className={`relative isolate cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-g-blue sm:p-5 ${
                      active
                        ? "-translate-y-1 ring-2 ring-ink shadow-[0_5px_0_0_var(--color-ink)]"
                        : "bg-white ring-1 ring-ink/15 hover:-translate-y-0.5 hover:ring-ink/40"
                    }`}
                  >
                    {active && <TierArt tier={t.id} compact className="-z-10" />}
                    <input type="radio" name="tier" value={t.id} checked={active} onChange={() => chooseTier(t.id)} className="sr-only" />
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-bold">{t.name}</span>
                      <span
                        aria-hidden
                        className={`grid size-6 place-items-center rounded-full transition-colors ${active ? "bg-ink text-white" : "ring-2 ring-ink/20"}`}
                      >
                        {active && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="type-condensed mt-3 block text-4xl">{priceLabel(t)}</span>
                    <span className="mt-1 block max-w-[78%] text-xs text-ink/75">
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
              <div role="group" aria-labelledby="qty-label" className="flex items-center gap-1 rounded-full bg-white p-1 ring-2 ring-ink">
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
        <Panel step="2" tone="bg-p-red" title="Your details" hint="We'll send the order confirmation here.">
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
        <Panel step="3" tone="bg-p-green" title={seats > 1 ? "Who's coming?" : "Who's this ticket for?"} hint="Each person gets their own ticket and QR code by email.">
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink/60">
              {tier.name} × {units}
            </p>
            <p className="type-condensed text-3xl">{total === 0 ? "Free" : formatNaira(total)}</p>
          </div>
          <button type="submit" disabled={busy} className={`h-12 px-6 text-sm ${primaryBtn}`}>
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : total > 0 && <Lock aria-hidden className="size-4" />}
            {total === 0 ? "Get ticket" : "Pay now"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-[2rem] bg-white ring-2 ring-ink shadow-[6px_6px_0_0_var(--color-ink)]">
          <div className="relative isolate border-b-2 border-ink p-6 sm:p-7" style={{ backgroundColor: tierColor[tier.id] }}>
            <TierArt tier={tier.id} className="-z-10" />
            <h2 className="font-mono text-xs font-semibold tracking-[0.18em] uppercase">Order summary</h2>
            <p className="type-heading mt-4 text-3xl">{tier.name}</p>
            <p className="mt-1 text-sm text-ink/75">
              {units} × {priceLabel(tier)}
              {tier.seatsPerUnit > 1 && ` · ${seats} people`}
            </p>
          </div>

          <div className="p-6 sm:p-7">
            <ul className="space-y-2.5 text-sm">
              {tier.perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-p-green ring-1 ring-ink/20">
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-baseline justify-between border-t-2 border-dashed border-ink/20 pt-5">
              <span className="font-semibold">Total</span>
              <span className="type-condensed text-5xl">{total === 0 ? "Free" : formatNaira(total)}</span>
            </div>

            <button type="submit" disabled={busy} className={`mt-6 h-14 w-full text-sm ${primaryBtn}`}>
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

            <div aria-live="polite">
              {status.kind === "error" && <p className="mt-4 rounded-xl bg-p-red px-4 py-3 text-sm font-medium text-[#a50e0e]">{status.message}</p>}
              {status.kind === "cancelled" && (
                <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink/80">Payment cancelled. Your details are still here, so you can try again.</p>
              )}
            </div>

            {total > 0 && (
              <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink/60">
                <ShieldCheck aria-hidden className="size-4 text-g-green" /> Secured by Paystack
              </p>
            )}
          </div>
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

function Panel({ step, tone, title, hint, children }: { step: string; tone: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="relative rounded-[2rem] bg-white p-5 ring-1 ring-ink/10 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-ink ring-2 ring-ink ${tone}`}>
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

"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { Field, Section } from "./FormUI";
import MerchFields from "./MerchFields";
import { existingMerchSchema, type MerchFields as Selection } from "@/lib/tickets/merch";
import { fieldErrors } from "@/lib/tickets/schema";

export default function ExistingMerchForm() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [selection, setSelection] = useState<Selection>({ merch: "", shirtSize: "", shirtColor: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setMessage("");
    const parsed = existingMerchSchema.safeParse({ code, email, selection: { merch: selection.merch || undefined, shirtSize: selection.shirtSize || undefined, shirtColor: selection.shirtColor || undefined } });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true], [data-invalid=true]")?.focus());
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const response = await fetch("/api/tickets/merch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.fields ?? {});
        setMessage(data.error ?? "Couldn't save your merch. Please try again.");
      } else setSaved(true);
    } catch { setMessage("Check your connection and try again. Your choices are still here."); }
    finally { setBusy(false); }
  }

  if (saved) return (
    <div role="status" className="rounded-3xl bg-white p-5 ring-1 ring-ink/[0.08] sm:p-7">
      <Check aria-hidden className="mb-4 size-8 text-g-green" />
      <h2 className="type-heading text-2xl">Your merch choice is saved!</h2>
      <p className="mt-2 text-sm text-ink/70">{selection.merch === "shirt" ? `Shirt · ${selection.shirtSize} · ${selection.shirtColor}` : "Tote bag"} for ticket {code.trim().toUpperCase()}.</p>
      <button type="button" onClick={() => setSaved(false)} className="mt-6 h-12 rounded-full bg-ink px-6 text-sm font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue">Choose for another ticket or edit</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-8">
      <Section title="Your ticket" hint="Already purchased? Use the details on your ticket to choose your merch.">
        <fieldset disabled={busy} className="space-y-5">
          <legend className="sr-only">Ticket holder and merch details</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ticket code" error={errors.code}>
              {(p) => <input {...p} autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX" />}
            </Field>
            <Field label="Ticket holder’s email" error={errors.email}>
              {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
          </div>
          <p className="text-sm text-ink/60">Find the code on your downloaded ticket. For Padi tickets, submit each person’s choice using their own code and email.</p>
          <div className="border-t border-ink/10 pt-5">
            <MerchFields value={selection} onChange={setSelection} errors={{ merch: errors['selection.merch'], shirtSize: errors['selection.shirtSize'], shirtColor: errors['selection.shirtColor'] }} />
          </div>
          {message && <p role="alert" className="rounded-xl bg-p-red px-4 py-3 text-sm font-medium text-ink">{message}</p>}
          <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:cursor-wait disabled:opacity-70">
            {busy && <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />}
            {busy ? 'Saving your choice…' : 'Save my merch choice'}
          </button>
        </fieldset>
      </Section>
      <aside className="rounded-3xl bg-white p-5 ring-1 ring-ink/[0.08] sm:p-7 lg:sticky lg:top-28">
        <h2 className="type-heading text-xl sm:text-2xl">Your merch</h2>
        <p className="mt-2 text-sm text-ink/60">One item per ticket holder, included with your paid ticket.</p>
        <p className="mt-5 border-t border-ink/10 pt-5 font-semibold">
          {selection.merch === "shirt" ? `Shirt${selection.shirtSize ? ` · ${selection.shirtSize}` : " · Choose a size"}${selection.shirtColor ? ` · ${selection.shirtColor}` : " · Choose a colour"}` : selection.merch === "tote" ? "Tote bag" : "Choose a shirt or a tote bag"}
        </p>
        <p className="mt-2 text-sm text-ink/60">You can return here to update your choice.</p>
      </aside>
    </form>
  );
}

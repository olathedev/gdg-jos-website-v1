"use client";

import { Check } from "lucide-react";
import { Field } from "./FormUI";
import { useId } from "react";
import { shirtSizes, type MerchFields as Selection } from "@/lib/tickets/merch";

export default function MerchFields({ value, onChange, errors = {}, disabled = false }: {
  value: Selection; onChange: (value: Selection) => void; errors?: Record<string, string>; disabled?: boolean;
}) {
  const id = useId();
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <legend className="mb-2 text-sm font-medium">Merch (required)</legend>
      <div className="grid grid-cols-2 gap-3">
        {([['shirt', 'Shirt'], ['tote', 'Tote bag']] as const).map(([item, label]) => (
          <label key={item} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 transition-shadow has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-g-blue ${value.merch === item ? 'bg-p-blue ring-2 ring-ink' : 'bg-white ring-1 ring-ink/12 hover:ring-ink/30'}`}>
            <input type="radio" name={`${id}-merch`} value={item} checked={value.merch === item} required
              data-invalid={errors.merch ? "true" : undefined} aria-describedby={errors.merch ? `${id}-error` : undefined}
              onChange={() => onChange({ merch: item, shirtSize: "" })} className="sr-only" />
            <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-full ${value.merch === item ? "bg-ink text-white" : "ring-2 ring-ink/20"}`}>
              {value.merch === item && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className="font-semibold">{label}</span>
          </label>
        ))}
      </div>
      {errors.merch && <p id={`${id}-error`} className="text-sm text-g-red">{errors.merch}</p>}
      {value.merch === "shirt" && (
        <Field label="Shirt size (required)" error={errors.shirtSize}>
          {(p) => <select {...p} value={value.shirtSize} onChange={(e) => onChange({ ...value, shirtSize: e.target.value })}>
            <option value="">Select your size</option>
            {shirtSizes.map((size, i) => <option key={size} value={size}>{["Small (S)", "Medium (M)", "Large (L)", "Extra large (XL)", "2X large (XXL)"][i]}</option>)}
          </select>}
        </Field>
      )}
    </fieldset>
  );
}

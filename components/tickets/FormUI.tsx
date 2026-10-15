"use client";

import { useId, type ReactNode } from "react";

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
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

type InputProps = { id: string; name: string; required: boolean; "aria-invalid": boolean; "aria-describedby"?: string; className: string };

export function Field({ label, error, optional = false, className = "", children }: { label: string; error?: string; optional?: boolean; className?: string; children: (p: InputProps) => ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>
      {children({
        id,
        name: id,
        required: !optional,
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


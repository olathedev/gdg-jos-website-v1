"use client";

import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import Icon from "./Icon";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type Option = { value: string; label: string; dot?: string };

/**
 * Accessible custom select (listbox) with keyboard support.
 * `variant="field"` is the full-width form version (label shown outside it);
 * pass `name` to submit the value with a form.
 */
export default function Dropdown({
  label,
  value,
  options,
  onChange,
  align = "left",
  variant = "pill",
  name,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  align?: "left" | "right";
  variant?: "pill" | "field";
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const choose = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
    button.current?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const field = variant === "field";
  return (
    <div ref={root} className={`relative ${field ? "w-full" : ""}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        className={`inline-flex h-10 items-center gap-2 border bg-white text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue ${
          field ? "w-full rounded-xl pr-2.5 pl-3 text-base sm:text-sm" : "rounded-full pr-3 pl-4"
        } ${open ? (field ? "border-ink/30 ring-4 ring-zinc-100" : "border-ink/30") : "border-zinc-200 hover:border-zinc-300"}`}
      >
        {!field && <span className="text-zinc-500">{label}</span>}
        <span className={`flex items-center gap-1.5 font-medium text-ink ${field ? "min-w-0 flex-1 truncate text-left" : ""}`}>
          {current.dot && <span aria-hidden className={`size-2 rounded-full ${current.dot}`} />}
          {current.label}
        </span>
        <span className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <Icon icon={ArrowDown01Icon} className="size-4" />
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className={`absolute top-full z-40 mt-1.5 max-h-72 min-w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-900/[0.06] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap ${i === active ? "bg-zinc-100" : ""}`}
              >
                {o.dot && <span aria-hidden className={`size-2 rounded-full ${o.dot}`} />}
                <span className="flex-1">{o.label}</span>
                {selected && <Icon icon={Tick02Icon} className="size-4 text-ink" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

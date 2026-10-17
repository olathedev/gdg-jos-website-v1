"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, savedTheme, THEME_KEY, type ThemeChoice } from "@/lib/quest/theme";

const OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** System / Light / Dark, saved on this device. */
export default function ThemeSwitch() {
  const choice = useSyncExternalStore(subscribe, savedTheme, () => "system" as ThemeChoice);
  const pick = (c: ThemeChoice) => {
    try {
      localStorage.setItem(THEME_KEY, c);
    } catch {}
    applyTheme(c);
    listeners.forEach((fn) => fn());
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[11px] font-bold tracking-[0.2em] text-fg/45">APPEARANCE</legend>
      <div className="grid grid-cols-3 gap-1 rounded-full border border-fg/[0.12] bg-surface p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={choice === o.id}
            onClick={() => pick(o.id)}
            className={`min-h-11 rounded-full text-sm font-bold transition-colors ${
              choice === o.id ? "bg-fg text-on-fg" : "text-fg/70 hover:text-fg"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

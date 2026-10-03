"use client";

import { useState } from "react";
import { VolunteerCard, gridCls, groups, people } from "./VolunteerCard";

/** All volunteers: the 2026 crew, then 2025 alumni. Filterable by year. */
export default function VolunteerGrid() {
  const [group, setGroup] = useState<string | null>(null);
  const shown = group ? people.filter((p) => p.group === group) : people;

  const chip = (label: string, value: string | null, count: number) => {
    const active = group === value;
    return (
      <button
        key={label}
        type="button"
        aria-pressed={active}
        onClick={() => setGroup(value)}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue ${
          active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
        }`}
      >
        {label}
        <span className={`text-xs ${active ? "text-white/60" : "text-ink/45"}`}>{count}</span>
      </button>
    );
  };

  return (
    <>
      {/* Filters only make sense with more than one group (e.g. when 2025 alumni are shown). */}
      {groups.length > 1 && (
        <div role="group" aria-label="Filter volunteers" className="mb-10 flex flex-wrap gap-2">
          {chip("Everyone", null, people.length)}
          {groups.map((g) => chip(g.label, g.id, g.count))}
        </div>
      )}
      <ul className={gridCls}>
        {shown.map((v, i) => (
          <VolunteerCard key={v.name} {...v} index={i} />
        ))}
      </ul>
    </>
  );
}

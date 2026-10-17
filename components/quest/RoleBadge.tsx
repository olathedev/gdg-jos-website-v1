import { ROLE_INFO, type StaffRole } from "@/lib/quest/roles";

// What someone IS at this event (stack tags say what they work with). Solid colour, white text,
// square-ish corners and an icon, so it never reads as a stack tag. Shown right after the name.

function RoleIcon({ role, size }: { role: StaffRole; size: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (role === "organiser")
    return (
      <svg {...p}>
        <circle cx="8" cy="15" r="4" />
        <path d="M10.8 12.2 20 3M16 7l3 3M14 9l2 2" />
      </svg>
    );
  if (role === "co_organiser")
    return (
      <svg {...p}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.6" />
        <path d="M16.5 14.2c2.6.3 4.5 2.6 4.5 5.3" />
      </svg>
    );
  return (
    <svg {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </svg>
  );
}

export function roleRing(role: StaffRole | null | undefined) {
  return role ? ROLE_INFO[role].color : undefined;
}

/** Small badge after a name. `circle` adds "SPEAKER · DevFest Jos 2026" (the large profile version). */
export default function RoleBadge({ role, circle, large = false }: { role: StaffRole; circle: string; large?: boolean }) {
  const info = ROLE_INFO[role];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-[8px] font-bold tracking-[0.06em] text-white uppercase ${
        large ? "px-2.5 py-1 text-[13px]" : "px-1.5 py-[3px] text-[12px] leading-none"
      }`}
      style={{ background: info.color }}
    >
      <RoleIcon role={role} size={large ? 16 : 14} />
      <span aria-hidden>
        {info.word}
        {large && <span className="font-semibold normal-case tracking-normal"> · {circle}</span>}
      </span>
      <span className="sr-only">
        , {info.label} at {circle}
      </span>
    </span>
  );
}

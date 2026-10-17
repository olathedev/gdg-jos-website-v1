import { activeLabel } from "@/lib/quest/presence";

/** Green dot with "Active now" / "Active N min ago". Renders nothing when older than an hour. */
export default function ActiveDot({ at, now }: { at: string | null | undefined; now?: number }) {
  const label = activeLabel(at, now);
  if (!label) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-live">
      <span aria-hidden className="size-2 rounded-full bg-[#34A853] shadow-[0_0_0_2px_rgb(52_168_83/0.25)]" />
      {label}
    </span>
  );
}

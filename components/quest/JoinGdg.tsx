import { ArrowUpRight } from "lucide-react";
import { COMMUNITY_JOIN_URL } from "@/lib/quest/config";

/** "Join GDG Jos" on GDG Community. Opens in a new tab. */
export default function JoinGdg() {
  return (
    <a
      href={COMMUNITY_JOIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-14 items-center gap-3 rounded-[24px] border border-g-blue/40 bg-g-blue/10 px-4 py-3 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue active:scale-[0.98]"
    >
      <span aria-hidden className="type-heading flex size-10 shrink-0 items-center justify-center rounded-full bg-g-blue text-sm font-bold text-white">
        {"{ }"}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[15px] font-bold">Join GDG Jos</span>
        <span className="text-xs text-white/60">Meetups, events and people all year round</span>
      </span>
      <ArrowUpRight aria-hidden className="size-5 text-white/60" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

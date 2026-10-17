import { ArrowUpRight } from "lucide-react";
import { WHATSAPP_URL } from "@/data/devfest26";
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
        <span className="text-xs text-fg/60">Meetups, events and people all year round</span>
      </span>
      <ArrowUpRight aria-hidden className="size-5 text-fg/60" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** The GDG Jos WhatsApp group. Opens WhatsApp (or a new tab). */
export function JoinWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-14 items-center gap-3 rounded-[24px] border border-g-green/40 bg-g-green/10 px-4 py-3 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-green active:scale-[0.98]"
    >
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-g-green text-white">
        <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
        </svg>
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[15px] font-bold">Join the GDG Jos WhatsApp</span>
        <span className="text-xs text-fg/60">News, events and chat with the community</span>
      </span>
      <ArrowUpRight aria-hidden className="size-5 text-fg/60" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

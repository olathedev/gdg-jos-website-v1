import { Globe } from "lucide-react";
import { BrandMark } from "./icons";

/**
 * "Follow GDG Jos": the circle's socials as one row of round icon buttons, right under the
 * WhatsApp button. Plain links (no points; follow points stay in the Socials stage).
 * One line at any width: it scrolls sideways rather than wrapping.
 */
export default function CircleSocials({ host, links }: { host: string; links: { id: string; name: string; href: string }[] }) {
  if (!links.length) return null;
  return (
    <section className="-mt-2 flex flex-col gap-2" aria-labelledby="circle-socials-h">
      <h2 id="circle-socials-h" className="px-1 text-[11px] font-bold tracking-[0.2em] text-fg/45">
        FOLLOW {host.toUpperCase()}
      </h2>
      <ul className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {links.map((l) => (
          <li key={l.id} className="shrink-0">
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${host} on ${l.name} (opens in a new tab)`}
              className="flex size-11 items-center justify-center rounded-full border border-fg/[0.12] bg-surface text-fg transition-transform hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h-yellow active:scale-95"
            >
              {l.id === "website" ? <Globe aria-hidden className="size-5" /> : <BrandMark id={l.id} size={20} />}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

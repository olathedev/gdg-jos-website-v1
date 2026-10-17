"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { partnerFollowAction, partnerVisitAction } from "@/app/quest/actions";
import { PARTNER_VISIT_SECONDS, POINTS } from "@/lib/quest/config";
import { BrandMark } from "./icons";

/** Partner logo from its https link, or initials when there is none. */
export function PartnerLogo({ name, url, size = 56 }: { name: string; url: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- organiser-provided https link, any host
    <img src={url} alt={`${name} logo`} width={size} height={size} loading="lazy" className="shrink-0 rounded-2xl bg-white object-contain p-1.5" style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className="type-heading flex shrink-0 items-center justify-center rounded-2xl bg-surface-3 font-bold text-fg"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </span>
  );
}

/** Claims the online visit after PARTNER_VISIT_SECONDS on the page (the server checks the time too). */
export function VisitTimer({ stationId, name, done }: { stationId: string; name: string; done: boolean }) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (done) return;
    const t = setTimeout(async () => {
      const res = await partnerVisitAction(stationId);
      if (res?.ok && res.message) setMessage(`${res.message} for checking out ${name}`);
    }, (PARTNER_VISIT_SECONDS + 0.5) * 1000);
    return () => clearTimeout(t);
  }, [done, stationId, name]);
  return message ? (
    <p role="status" className="quest-pop rounded-full border border-g-green/40 bg-g-green/10 px-4 py-2.5 text-center text-sm font-bold text-good">
      {message}
    </p>
  ) : (
    <span role="status" className="sr-only" />
  );
}

/** One Follow row per platform: opens the partner's page in a new tab and claims, like the GDG Jos follows. */
export function PartnerFollows({
  stationId,
  name,
  socials,
  followed,
}: {
  stationId: string;
  name: string;
  socials: { id: string; name: string; href: string }[];
  followed: string[];
}) {
  const [, start] = useTransition();
  const [done, add] = useOptimistic(followed, (cur, id: string) => [...cur, id]);
  return (
    <ul className="flex flex-col gap-2">
      {socials.map((s) => {
        const on = done.includes(s.id);
        return (
          <li key={s.id}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (on) return;
                start(async () => {
                  add(s.id);
                  await partnerFollowAction(stationId, s.id);
                });
              }}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 transition-transform active:scale-[0.98] ${
                on ? "border-g-green/60 bg-surface" : "border-fg/[0.08] bg-surface hover:border-fg/25"
              }`}
            >
              <span aria-hidden className={`flex size-10 items-center justify-center rounded-full ${on ? "bg-fg text-on-fg" : "bg-surface-3 text-fg"}`}>
                <BrandMark id={s.id} size={20} />
              </span>
              <span className="flex-1 text-sm font-bold">Follow on {s.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${on ? "bg-g-green text-white" : "bg-h-yellow text-[#0A0A0A]"}`}>
                {on ? (
                  <span className="flex items-center gap-1">
                    <Check aria-hidden className="size-3" strokeWidth={4} /> Done
                  </span>
                ) : (
                  `+${POINTS.partnerFollow}`
                )}
              </span>
              <ArrowUpRight aria-hidden className="size-4 text-fg/50" />
              <span className="sr-only">{on ? `Followed ${name} on ${s.name}` : `(opens ${s.name} in a new tab)`}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

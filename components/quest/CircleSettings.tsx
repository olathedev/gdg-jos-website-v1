"use client";

import { useActionState } from "react";
import { type AdminResult, saveCircleSettingsAction } from "@/app/c/actions";
import { gameBtn } from "./ui";

const field =
  "h-12 w-full rounded-2xl border border-fg/[0.12] bg-surface px-4 text-base text-fg outline-none placeholder:text-fg/30 focus:border-h-yellow";
const label = "text-[11px] font-bold tracking-[0.2em] text-fg/50";

type Values = { whatsapp_url: string | null; x: string | null; instagram: string | null; linkedin: string | null; facebook: string | null; youtube: string | null; website_url: string | null };

/** The circle's WhatsApp group and socials, shown under the WhatsApp button on Home. */
export default function CircleSettings({ slug, host, values }: { slug: string; host: string; values: Values }) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(saveCircleSettingsAction.bind(null, slug), null);
  const handles = [
    { id: "x", name: "X" },
    { id: "instagram", name: "Instagram" },
    { id: "linkedin", name: "LinkedIn page" },
    { id: "facebook", name: "Facebook" },
    { id: "youtube", name: "YouTube" },
  ] as const;
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={label}>WHATSAPP GROUP LINK</span>
        <input name="whatsapp_url" type="url" defaultValue={values.whatsapp_url ?? ""} placeholder="https://chat.whatsapp.com/…" className={field} />
        <span className="text-xs text-fg/50">Empty uses the GDG Jos group link built into the site.</span>
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className={`${label} mb-2`}>FOLLOW {host.toUpperCase()} (HANDLES ONLY, NO POINTS)</legend>
        <div className="grid grid-cols-2 gap-2">
          {handles.map((h) => (
            <label key={h.id} className="flex flex-col gap-1">
              <span className="text-xs font-bold text-fg/60">{h.name}</span>
              <input name={h.id} defaultValue={values[h.id] ?? ""} placeholder="handle" autoComplete="off" className={field} />
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-2">
        <span className={label}>WEBSITE</span>
        <input name="website_url" type="url" defaultValue={values.website_url ?? ""} placeholder="https://…" className={field} />
      </label>
      <button type="submit" disabled={pending} className={gameBtn}>
        {pending ? "Saving…" : "Save"}
      </button>
      {state && (
        <p role="status" className={`rounded-full border px-4 py-2.5 text-center text-sm font-bold ${state.ok ? "border-g-green/40 bg-g-green/10 text-good" : "border-g-red/40 bg-g-red/10 text-bad"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

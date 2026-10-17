"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addManagerAction,
  addPartnerAction,
  type AdminResult,
  partnerLogoSignAction,
  removeManagerAction,
  resetBoothAction,
  savePartnerAction,
} from "@/app/c/actions";
import type { EditablePartner } from "@/lib/quest/partner-admin";
import { UploadError, uploadImage } from "@/lib/upload-image";
import { PARTNER_SOCIALS } from "@/lib/quest/validate";
import { PartnerLogo } from "./PartnerProfile";
import { gameBtn, gameBtnGhost } from "./ui";

const field =
  "h-12 w-full rounded-2xl border border-fg/[0.12] bg-surface px-4 text-base text-fg outline-none placeholder:text-fg/30 focus:border-h-yellow";
const label = "text-[11px] font-bold tracking-[0.2em] text-fg/50";
const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

function Status({ state }: { state: AdminResult }) {
  if (!state) return null;
  return (
    <p role="status" className={`rounded-full border px-4 py-2.5 text-center text-sm font-bold ${state.ok ? "border-g-green/40 bg-g-green/10 text-good" : "border-g-red/40 bg-g-red/10 text-bad"}`}>
      {state.message}
    </p>
  );
}

/**
 * One partner's profile form. `full`: circle staff (every field). `public`: the partner's own
 * managers (logo, description, website, socials). The server applies the same split again.
 */
export function PartnerEditor({
  slug,
  partner,
  scope,
  canUpload,
  isOrganiser = false,
}: {
  slug: string;
  partner: EditablePartner;
  scope: "full" | "public";
  canUpload: boolean;
  isOrganiser?: boolean;
}) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(savePartnerAction.bind(null, slug, partner.id), null);
  const [description, setDescription] = useState(partner.description ?? "");
  const [logo, setLogo] = useState(partner.logo_url ?? "");
  const [upload, setUpload] = useState({ busy: false, message: "" });

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        {scope === "full" && (
          <label className="flex flex-col gap-2">
            <span className={label}>NAME</span>
            <input name="name" defaultValue={partner.name} required minLength={2} maxLength={60} className={field} />
          </label>
        )}
        <div className="flex items-center gap-3">
          <PartnerLogo name={partner.name} url={logo || null} size={64} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {canUpload && (
              <label className={`${gameBtnGhost} cursor-pointer self-start ${upload.busy ? "pointer-events-none opacity-60" : ""}`}>
                {upload.busy ? "Uploading…" : logo ? "Change logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) return setUpload({ busy: false, message: "Logos must be under 2 MB." });
                    setUpload({ busy: true, message: "" });
                    try {
                      setLogo(await uploadImage(file, () => partnerLogoSignAction(slug, partner.id), 400));
                      setUpload({ busy: false, message: "Uploaded. Press Save to use it." });
                    } catch (err) {
                      setUpload({ busy: false, message: err instanceof UploadError ? err.message : "Upload failed. Try again." });
                    }
                  }}
                />
              </label>
            )}
            <span className="text-xs text-fg/55">{upload.message || "JPG, PNG or WebP, under 2 MB. Shown at 400px."}</span>
          </div>
        </div>
        <input type="hidden" name="logo_url" value={logo} />
        <label className="flex flex-col gap-2">
          <span className={label}>
            DESCRIPTION <span className="tracking-normal text-fg/40">({description.length}/280)</span>
          </span>
          <textarea
            name="description"
            rows={3}
            maxLength={280}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-fg/[0.12] bg-surface px-4 py-3 text-base text-fg outline-none focus:border-h-yellow"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>WEBSITE</span>
          <input name="website_url" type="url" defaultValue={partner.website_url ?? ""} placeholder="https://…" className={field} />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className={`${label} mb-2`}>SOCIALS (HANDLES ONLY)</legend>
          <div className="grid grid-cols-2 gap-2">
            {PARTNER_SOCIALS.map((s) => (
              <label key={s.id} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-fg/60">{s.id === "linkedin" ? "LinkedIn page" : s.name}</span>
                <input name={s.id} defaultValue={partner[s.id] ?? ""} placeholder="handle" autoComplete="off" className={field} />
              </label>
            ))}
          </div>
        </fieldset>
        {scope === "full" && (
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex w-28 flex-col gap-2">
              <span className={label}>ORDER</span>
              <input name="sort_order" type="number" inputMode="numeric" defaultValue={partner.sort_order} className={field} />
            </label>
            <label className="flex min-h-12 items-center gap-2 text-sm font-bold">
              <input name="active" type="checkbox" defaultChecked={partner.active} className="size-5 accent-h-yellow" />
              Shown to players
            </label>
          </div>
        )}
        <button type="submit" disabled={pending} className={gameBtn}>
          {pending ? "Saving…" : "Save"}
        </button>
        <Status state={state} />
        {partner.updatedAt && (
          <p className="text-xs text-fg/50">
            Last edited {partner.updatedBy ? `by ${partner.updatedBy} ` : ""}on {when.format(new Date(partner.updatedAt))}
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-3 border-t border-fg/10 pt-4">
        <a href={`/c/${slug}/partners/${partner.id}/qr`} className={gameBtnGhost} download>
          Download booth QR
        </a>
        {scope === "full" && <ResetBooth slug={slug} id={partner.id} name={partner.name} />}
      </div>

      {scope === "full" && <Managers slug={slug} partner={partner} isOrganiser={isOrganiser} />}
    </div>
  );
}

function ResetBooth({ slug, id, name }: { slug: string; id: string; name: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        className="min-h-12 rounded-full border border-g-red/40 px-5 text-sm font-bold text-bad hover:bg-g-red/10 disabled:opacity-50"
        onClick={() => {
          if (!window.confirm(`Reset ${name}'s booth QR? Codes already printed for this partner stop working.`)) return;
          start(async () => setMessage((await resetBoothAction(slug, id))?.message ?? ""));
        }}
      >
        {pending ? "Resetting…" : "Reset booth QR"}
      </button>
      {message && <span className="text-xs font-bold text-fg/70">{message}</span>}
    </span>
  );
}

function Managers({ slug, partner, isOrganiser }: { slug: string; partner: EditablePartner; isOrganiser: boolean }) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(addManagerAction.bind(null, slug, partner.id), null);
  const [, start] = useTransition();
  return (
    <section className="flex flex-col gap-2 border-t border-fg/10 pt-4" aria-label={`${partner.name} managers`}>
      <h4 className={label}>PARTNER MANAGERS</h4>
      <p className="text-xs text-fg/60">They can edit this partner&apos;s logo, description, website and socials, and download its booth QR.</p>
      {partner.managers.length === 0 ? (
        <p className="text-sm text-fg/55">No managers yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {partner.managers.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold">{m.name}</span>
              {isOrganiser && (
                <button
                  type="button"
                  className="min-h-11 px-2 text-xs font-bold text-bad"
                  onClick={() => window.confirm(`Remove ${m.name} as a manager?`) && start(async () => void (await removeManagerAction(slug, partner.id, m.id)))}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {isOrganiser ? (
        <form action={action} className="flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Manager&apos;s PadiUp sign-in email</span>
            <input name="email" type="email" required placeholder="Their PadiUp sign-in email" className={field} />
          </label>
          <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-fg px-5 text-sm font-bold text-on-fg disabled:opacity-50">
            {pending ? "…" : "Add"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-fg/50">Only organisers can add or remove managers.</p>
      )}
      <Status state={state} />
    </section>
  );
}

export function AddPartner({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(addPartnerAction.bind(null, slug), null);
  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">New partner name</span>
          <input name="name" required minLength={2} maxLength={60} placeholder="New partner name" className={field} />
        </label>
        <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-fg px-5 text-sm font-bold text-on-fg disabled:opacity-50">
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

"use client";

import {
  ComputerIcon,
  CrownIcon,
  LeftToRightListBulletIcon,
  Link01Icon,
  Loading03Icon,
  MailSend01Icon,
  Money03Icon,
  SentIcon,
  SmartPhone01Icon,
  TextBoldIcon,
  Ticket02Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useActionState, useRef, useState, type ReactNode } from "react";
import { sendMessageAction, type MailState } from "@/app/admin-internal/mail/actions";
import { renderMessage, type Message } from "@/lib/mail/template";
import Icon, { type IconData } from "./Icon";

type Audience = "paid" | "vip" | "padi" | "buyers" | "one";

const audiences: { id: Audience; label: string; hint: string; icon: IconData }[] = [
  { id: "paid", label: "Everyone paid", hint: "Buyers + holders", icon: UserGroupIcon },
  { id: "vip", label: "VIP", hint: "VIP orders", icon: CrownIcon },
  { id: "padi", label: "My Padi", hint: "My Padi orders", icon: Ticket02Icon },
  { id: "buyers", label: "Buyers only", hint: "Whoever paid", icon: Money03Icon },
  { id: "one", label: "One person", hint: "Any email", icon: UserIcon },
];

type Tool = "bold" | "link" | "list" | "name";
const tools: { id: Tool; label: string; icon: IconData }[] = [
  { id: "bold", label: "Bold", icon: TextBoldIcon },
  { id: "link", label: "Link", icon: Link01Icon },
  { id: "list", label: "List", icon: LeftToRightListBulletIcon },
];

const field =
  "w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-base outline-none sm:text-[15px] placeholder:text-zinc-400 hover:border-zinc-300 focus:border-ink/30 focus:ring-4 focus:ring-zinc-100";

function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-zinc-700">
      {children}
      {hint && <span className="text-xs font-normal text-zinc-400">{hint}</span>}
    </label>
  );
}

export default function MailComposer({ counts, me }: { counts: Record<Exclude<Audience, "one">, number>; me: string }) {
  const [audience, setAudience] = useState<Audience>("paid");
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [state, action, pending] = useActionState<MailState, FormData>(async (prev, fd) => {
    const res = await sendMessageAction(prev, fd);
    setConfirming(false);
    if (res?.ok && fd.get("intent") === "send") {
      setSubject("");
      setHeadline("");
      setBody("");
      setCtaLabel("");
      setCtaUrl("");
      setTo("");
      setToName("");
    }
    return res;
  }, null);

  const count = audience === "one" ? 1 : counts[audience];
  const msg: Message = { subject: subject || "Your subject line", headline, body: body || "Your message shows up here.", ctaLabel, ctaUrl };
  const sample = audience === "one" ? { email: to, name: toName || null } : { email: "", name: "Ada Okafor" };
  const html = renderMessage(msg, sample, audience === "one" ? "Sent to you by the DevFest Jos team." : undefined);

  /** Wrap the selection (or insert at the caret) and keep focus in the textarea. */
  const edit = (fn: (sel: string) => { text: string; select?: [number, number] }) => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const { text, select } = fn(body.slice(a, b));
    const next = body.slice(0, a) + text + body.slice(b);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const [s, e] = select ?? [text.length, text.length];
      el.setSelectionRange(a + s, a + e);
    });
  };
  const format = (kind: Tool) => {
    if (kind === "bold") edit((s) => ({ text: `**${s || "bold text"}**`, select: [2, 2 + (s || "bold text").length] }));
    if (kind === "link") edit((s) => ({ text: `[${s || "link text"}](https://)`, select: [(s || "link text").length + 3, (s || "link text").length + 11] }));
    if (kind === "list") edit((s) => ({ text: (s || "First point\nSecond point").split("\n").map((l) => `- ${l.replace(/^[-*]\s+/, "")}`).join("\n") }));
    if (kind === "name") edit(() => ({ text: "{{first_name}}" }));
  };

  const ready = subject.trim().length >= 3 && body.trim().length >= 10 && (audience !== "one" || /\S+@\S+\.\S+/.test(to));

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="space-y-7">
        {/* Audience */}
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-zinc-700">Send to</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {audiences.map((a) => {
              const on = audience === a.id;
              return (
                <label
                  key={a.id}
                  className={`relative flex cursor-pointer flex-col rounded-2xl border p-3.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-g-blue ${
                    on ? "border-ink bg-ink text-white" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <input type="radio" name="audience" value={a.id} checked={on} onChange={() => (setAudience(a.id), setConfirming(false))} className="sr-only" />
                  <span className="flex items-center justify-between">
                    <Icon icon={a.icon} className={`size-[18px] ${on ? "text-white" : "text-zinc-400"}`} />
                    {a.id !== "one" && <span className={`text-sm font-semibold tabular-nums ${on ? "text-white" : "text-ink"}`}>{counts[a.id]}</span>}
                  </span>
                  <span className="mt-3 text-sm font-medium">{a.label}</span>
                  <span className={`text-xs ${on ? "text-white/60" : "text-zinc-400"}`}>{a.hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {audience === "one" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="to">Email</Label>
              <input id="to" name="to" type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="ada@example.com" className={`${field} h-11`} />
            </div>
            <div>
              <Label htmlFor="toName" hint="Optional">
                Name
              </Label>
              <input id="toName" name="toName" value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Ada Okafor" maxLength={80} className={`${field} h-11`} />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="subject" hint={`${subject.length}/150`}>
            Subject
          </Label>
          <input id="subject" name="subject" required maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Doors open at 9am on Saturday" className={`${field} h-11`} />
        </div>

        <div>
          <Label htmlFor="headline" hint="Optional · defaults to the subject">
            Headline
          </Label>
          <input id="headline" name="headline" maxLength={120} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="See you Saturday, {{first_name}}" className={`${field} h-11`} />
        </div>

        <div>
          <Label htmlFor="body">Message</Label>
          <div className="overflow-hidden rounded-xl border border-zinc-200 transition-colors focus-within:border-ink/30 focus-within:ring-4 focus-within:ring-zinc-100 hover:border-zinc-300">
            <div className="flex items-center gap-0.5 border-b border-zinc-100 px-1.5 py-1.5">
              {tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => format(t.id)}
                  title={t.label}
                  aria-label={t.label}
                  className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-g-blue"
                >
                  <Icon icon={t.icon} className="size-4" />
                </button>
              ))}
              <span aria-hidden className="mx-1.5 h-5 w-px bg-zinc-200" />
              <button
                type="button"
                onClick={() => format("name")}
                className="h-8 rounded-lg px-2.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-g-blue"
              >
                + First name
              </button>
            </div>
            <textarea
              ref={textarea}
              id="body"
              name="body"
              required
              rows={11}
              maxLength={10000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={"Hi {{first_name}},\n\nDoors open at 9am. Bring your ticket QR code and a valid ID.\n\nSee you there!"}
              className="block w-full resize-y bg-white px-3.5 py-3 text-base leading-relaxed outline-none placeholder:text-zinc-400 sm:text-[15px]"
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">Leave a blank line between paragraphs. Links you paste become clickable.</p>
        </div>

        <div>
          <p className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-zinc-700">
            Button <span className="text-xs font-normal text-zinc-400">Optional</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <input name="ctaLabel" aria-label="Button label" maxLength={40} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="View schedule" className={`${field} h-11`} />
            <input name="ctaUrl" aria-label="Button link" type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://devfestjos.com/#schedule" className={`${field} h-11`} />
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-zinc-100 pt-6">
          {confirming ? (
            <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70 ring-inset sm:p-5">
              <p className="text-[15px] font-medium">
                Send &ldquo;{subject}&rdquo; to {count.toLocaleString()} {count === 1 ? "person" : "people"}?
              </p>
              <p className="mt-1 text-sm text-zinc-500">Emails go out straight away and can&apos;t be recalled.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  name="intent"
                  value="send"
                  disabled={pending}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue disabled:opacity-70"
                >
                  <Icon icon={pending ? Loading03Icon : SentIcon} className={`size-4 ${pending ? "animate-spin" : ""}`} />
                  {pending ? "Sending…" : "Yes, send now"}
                </button>
                <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="h-10 rounded-full px-4 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!ready || count === 0}
                onClick={() => setConfirming(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-white hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon icon={MailSend01Icon} className="size-4" />
                {audience === "one" ? "Send" : `Send to ${count.toLocaleString()}`}
              </button>
              <button
                type="submit"
                name="intent"
                value="test"
                disabled={!ready || pending}
                title={`Sends one copy to ${me}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 px-5 text-[15px] font-medium hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending && <Icon icon={Loading03Icon} className="size-4 animate-spin" />}
                Send test to me
              </button>
            </div>
          )}
          {state && (
            <p
              key={state.at}
              role="status"
              className={`mt-4 rounded-xl px-3.5 py-2.5 text-sm ring-1 ring-inset ${state.ok ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15" : "bg-rose-50 text-rose-700 ring-rose-600/15"}`}
            >
              {state.message}
            </p>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-700">Preview</p>
          <div role="group" aria-label="Preview width" className="flex rounded-full bg-zinc-100 p-0.5">
            {(
              [
                ["desktop", ComputerIcon],
                ["phone", SmartPhone01Icon],
              ] as const
            ).map(([d, icon]) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                aria-label={d === "desktop" ? "Desktop" : "Phone"}
                onClick={() => setDevice(d)}
                className={`grid h-7 w-9 place-items-center rounded-full transition-colors ${device === d ? "bg-white text-ink shadow-sm" : "text-zinc-500 hover:text-ink"}`}
              >
                <Icon icon={icon} className="size-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
          <div className="space-y-1 border-b border-zinc-200 bg-white px-4 py-3 text-[13px]">
            <p className="truncate">
              <span className="text-zinc-400">To&nbsp;&nbsp;</span>
              {audience === "one" ? to || "…" : `${audiences.find((a) => a.id === audience)!.label} (${count})`}
            </p>
            <p className="truncate font-medium">
              <span className="font-normal text-zinc-400">Subject&nbsp;&nbsp;</span>
              {subject || <span className="text-zinc-300">No subject yet</span>}
            </p>
          </div>
          <div className="flex justify-center">
            <iframe
              title="Email preview"
              srcDoc={html}
              sandbox=""
              className={`h-[34rem] border-0 bg-[#f0f0f0] transition-[width] duration-300 lg:h-[40rem] ${device === "phone" ? "w-[375px] max-w-full" : "w-full"}`}
            />
          </div>
        </div>
        {audience !== "one" && <p className="mt-2 text-xs text-zinc-400">Previewing as &ldquo;Ada&rdquo;. Each person sees their own first name.</p>}
      </div>
    </form>
  );
}

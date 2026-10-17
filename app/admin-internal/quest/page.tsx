import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/Chrome";
import QRCode from "qrcode";
import {
  AddPartner,
  AddQuestion,
  CommunityImport,
  PartnersSwitch,
  RemovePartner,
  RemoveQuestion,
  ReviewButton,
  RoundButton,
} from "@/components/admin/QuestForms";
import { adminSiteUrl } from "@/lib/admin/site";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { listPartners, listReports, listRoundQuestions, listRounds, partnersOpen, questStats } from "@/lib/quest/admin";
import { ROUND_TIME } from "@/lib/quest/config";
import { supabaseAuthEnabled } from "@/lib/quest/session";
import { phase } from "@/lib/quest/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "DevFest Quest · Admin", robots: { index: false, follow: false } };

const when = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-zinc-100 pt-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-zinc-500">{sub}</p>
      {children}
    </section>
  );
}

export default async function QuestAdminPage() {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const me = await currentAdmin();
  if (!me) redirect(base);
  const [stats, reports, rounds, partnerRows, site, questions, partnersLive] = await Promise.all([
    questStats(),
    listReports(),
    listRounds(),
    listPartners(),
    adminSiteUrl(),
    listRoundQuestions(),
    partnersOpen(),
  ]);
  const partners = await Promise.all(
    partnerRows.map(async (p) => {
      const url = `${site}/quest/s/${p.code}`;
      return { ...p, url, qr: await QRCode.toDataURL(url, { margin: 1, width: 600, errorCorrectionLevel: "M" }) };
    }),
  );

  const env = process.env;
  const setup = [
    { label: "Session secret", ok: (env.QUEST_SESSION_SECRET ?? "").length >= 32, note: "QUEST_SESSION_SECRET" },
    { label: "Google sign-in (Supabase Auth)", ok: supabaseAuthEnabled(), note: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" },
    { label: "X post checks", ok: Boolean(env.X_BEARER_TOKEN), note: "X_BEARER_TOKEN" },
    { label: "Scheduled jobs", ok: (env.CRON_SECRET ?? "").length >= 16, note: "CRON_SECRET" },
    { label: "Hall screen", ok: Boolean(env.QUEST_HALL_KEY), note: "QUEST_HALL_KEY" },
  ];
  const figures = [
    { label: "Players", value: stats.players, sub: `${stats.listed} listed in Who's coming` },
    { label: "Community claims", value: stats.claims, sub: `unverified · ${stats.matched} matched` },
    { label: "X posts", value: stats.xCounted, sub: `counted · ${stats.xPending} waiting for a check` },
    { label: "Open reports", value: stats.openReports, sub: `${stats.checkedIn} check-ins so far` },
  ];

  return (
    <AdminChrome base={base} user={me} active="quest">
      <h1 className="text-2xl font-semibold tracking-tight">DevFest Quest</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Phase: <span className="font-medium text-ink">{phase() === "pre" ? "Before the event" : phase() === "event" ? "Event day" : "After the event"}</span>
        {env.QUEST_PHASE && <span className="text-yellow-700"> (forced by QUEST_PHASE)</span>}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {figures.map((f) => (
          <div key={f.label} className="rounded-2xl px-3 py-4 sm:px-5">
            <dt className="text-sm text-zinc-500">{f.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{f.value}</dd>
            <dd className="mt-1 text-xs text-zinc-400">{f.sub}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 space-y-14">
        <Section
          title="Brain Blitz rounds"
          sub={`Stage 3. Open a round when you announce it; players get ${ROUND_TIME} from the moment they tap Start, one attempt each. Close it when you're done: no new starts, and anyone mid-round has up to ${ROUND_TIME} to finish before the leaderboard is final.`}
        >
          <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80">
            {rounds.map((r) => {
              const live = Boolean(r.opened_at) && !r.closed_at;
              return (
                <li key={r.round} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span aria-hidden className={`size-2 rounded-full ${live ? "bg-emerald-500" : r.closed_at ? "bg-zinc-400" : "bg-zinc-200"}`} />
                    <span className="font-medium">Round {r.round}</span>
                    <span className="text-zinc-500">
                      {live ? "Live" : r.closed_at ? `Closed ${when.format(new Date(r.closed_at))}` : "Not opened"} · {r.plays} played ·{" "}
                      {r.questions} questions
                    </span>
                  </span>
                  <span className="flex gap-2">
                    {!live && <RoundButton round={r.round} op="open" label={r.closed_at ? "Reopen" : "Open round"} />}
                    {live && <RoundButton round={r.round} op="close" label="Close round" />}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="Brain Blitz questions"
          sub="Add questions from the talks before you open a round. Each player gets 10 questions from the round, picked at random if it has more than 10. Remove only takes a question out of its round; answers and points already given stay."
        >
          <AddQuestion />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((r) => (
              <div key={r} className="rounded-2xl border border-zinc-200/80 p-4">
                <p className="mb-3 text-sm font-medium">
                  Round {r} <span className="text-zinc-400">· {questions[r].length} questions</span>
                </p>
                <ol className="space-y-2.5">
                  {questions[r].map((q) => (
                    <li key={q.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="block">{q.question}</span>
                        <span className="block text-xs text-emerald-700">{q.options[q.correct]}</span>
                        {q.answers > 0 && <span className="block text-xs text-zinc-400">{q.answers} answers</span>}
                      </span>
                      <RemoveQuestion id={q.id} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Partners"
          sub="Stage 4. Add each partner, then print their QR and give it to the people at their stand. Players scan it after asking about the partner. The stage stays closed for everyone until you open it here; after that each player still needs 3 padis. Remove only works before anyone has scanned."
        >
          <div className="mb-5">
            <PartnersSwitch open={partnersLive} />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <AddPartner />
            {partners.length > 0 && (
              <a
                href={`${base}/quest/print`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium hover:bg-zinc-50"
              >
                Print all partner QR codes
              </a>
            )}
          </div>
          {partners.length > 0 && (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <li key={p.id} className="flex gap-4 rounded-2xl border border-zinc-200/80 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
                  <img src={p.qr} alt={`QR for ${p.name}`} className="size-24 shrink-0 rounded-lg border border-zinc-100" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="text-zinc-500">{p.scans} scans</span>
                    <a href={p.qr} download={`partner-${p.name.replace(/\W+/g, "-").toLowerCase()}.png`} className="text-xs font-medium text-ink underline">
                      Download QR
                    </a>
                    <span className="truncate text-xs text-zinc-400">{p.url}</span>
                  </div>
                  <RemovePartner id={p.id} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Connections" sub="What's configured on this server. Missing items are set as environment variables, then redeploy.">
          <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80">
            {setup.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className={`size-2 rounded-full ${s.ok ? "bg-emerald-500" : "bg-zinc-300"}`} />
                  {s.label}
                </span>
                <span className={`text-xs ${s.ok ? "text-emerald-700" : "text-zinc-400"}`}>{s.ok ? "Connected" : `Needs ${s.note}`}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="GDG Community members"
          sub="Players get their +15 as soon as they tap Join GDG Jos (taken on trust). To check prize winners, export the GDG Jos member list from gdg.community.dev and upload it here: claims whose sign-in email is on the list are marked matched. Upload it again any time; nobody is paid twice."
        >
          <CommunityImport />
        </Section>

        <Section title="Reports" sub="Players reported from the Crew screen. Both people are already hidden from each other; check each report at least twice a day.">
          {reports.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/80 px-5 py-10 text-center text-sm text-zinc-500">No reports.</p>
          ) : (
            <ul className="space-y-2">
              {reports.map((r) => (
                <li key={`${r.blocker}:${r.blocked}`} className="rounded-2xl border border-zinc-200/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 text-sm">
                      <p>
                        <span className="font-medium">{r.reporterName}</span> <span className="text-zinc-400">({r.reporterEmail})</span> reported{" "}
                        <span className="font-medium">{r.reportedName}</span> <span className="text-zinc-400">({r.reportedEmail})</span>
                      </p>
                      <p className="mt-1 text-zinc-600">{r.reason ?? <span className="text-zinc-400">No reason given</span>}</p>
                      <p className="mt-1 text-xs text-zinc-400">{when.format(new Date(r.created_at))}</p>
                    </div>
                    {r.status === "open" ? (
                      <ReviewButton blocker={r.blocker} blocked={r.blocked} />
                    ) : (
                      <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">Reviewed</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AdminChrome>
  );
}

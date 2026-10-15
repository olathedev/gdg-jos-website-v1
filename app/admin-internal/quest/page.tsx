import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/Chrome";
import { CommunityImport, ReviewButton } from "@/components/admin/QuestForms";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { listReports, questStats } from "@/lib/quest/admin";
import { supabaseAuthEnabled } from "@/lib/quest/session";
import { phase } from "@/lib/quest/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agent Mode · Admin", robots: { index: false, follow: false } };

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
  const [stats, reports] = await Promise.all([questStats(), listReports()]);

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
    { label: "Community claims", value: stats.claims, sub: `waiting · ${stats.matched} matched` },
    { label: "X posts", value: stats.xCounted, sub: `counted · ${stats.xPending} waiting for a check` },
    { label: "Open reports", value: stats.openReports, sub: `${stats.checkedIn} check-ins so far` },
  ];

  return (
    <AdminChrome base={base} user={me} active="quest">
      <h1 className="text-2xl font-semibold tracking-tight">Agent Mode</h1>
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
          sub="Export the GDG Jos member list from gdg.community.dev and upload it here. Everyone who tapped Join and signed in with an email on the list gets their +15. Upload it again any time; nobody is paid twice."
        >
          <CommunityImport />
        </Section>

        <Section title="Reports" sub="Agents reported from the Crew screen. Both people are already hidden from each other; check each report at least twice a day.">
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

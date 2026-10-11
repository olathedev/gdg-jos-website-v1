import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/Chrome";
import MailComposer from "@/components/admin/MailComposer";
import TicketSender from "@/components/admin/TicketSender";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { audienceCounts, recentMail, type MailKind } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mail · Admin", robots: { index: false, follow: false } };

const when = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
const kindMeta: Record<MailKind, { label: string; pill: string }> = {
  broadcast: { label: "Broadcast", pill: "bg-indigo-50 text-indigo-700" },
  individual: { label: "Message", pill: "bg-sky-50 text-sky-700" },
  ticket: { label: "Ticket", pill: "bg-emerald-50 text-emerald-700" },
};

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-zinc-100 pt-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 mb-6 text-sm text-zinc-500">{sub}</p>
      {children}
    </section>
  );
}

export default async function MailPage() {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const me = await currentAdmin();
  if (!me) redirect(base);
  const [counts, log] = await Promise.all([audienceCounts(), recentMail()]);

  return (
    <AdminChrome base={base} user={me} active="mail">
      <h1 className="text-2xl font-semibold tracking-tight">Mail</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Message ticket holders or resend a ticket. {!process.env.RESEND_API_KEY && <span className="text-yellow-700">RESEND_API_KEY isn&apos;t set, so emails are saved to .dev-emails instead of sent.</span>}
      </p>

      <div className="mt-8">
        <MailComposer counts={counts} me={me.email} />
      </div>

      <div className="mt-14 space-y-14">
        <Section title="Resend a ticket" sub="Find a ticket and send it to its holder again, or to a different address.">
          <TicketSender />
        </Section>

        <Section title="Sent" sub="The last 20 emails sent from this page.">
          {log.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/80 px-5 py-12 text-center text-sm text-zinc-500">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80">
              {log.map((m) => (
                <li key={m.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                  <span className={`self-start rounded-lg px-2.5 py-1 text-xs font-medium sm:self-auto ${kindMeta[m.kind].pill}`}>{kindMeta[m.kind].label}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.subject}</p>
                    <p className="truncate text-sm text-zinc-500">
                      To {m.audience} · by {m.sent_by}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm sm:text-right">
                    <span className="tabular-nums">
                      {m.sent}
                      <span className="text-zinc-400">/{m.recipients} sent</span>
                      {m.failed > 0 && <span className="ml-2 text-rose-600">{m.failed} failed</span>}
                    </span>
                    <span className="whitespace-nowrap text-zinc-400">{when.format(new Date(m.created_at))}</span>
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

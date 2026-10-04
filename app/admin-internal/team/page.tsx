import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/Chrome";
import { InviteForm, ReissueButton, RemoveButton } from "@/components/admin/TeamForms";
import { adminEnabled, adminPath, canRemove, currentAdmin, invitableBy, roleLabel } from "@/lib/admin/auth";
import { listMembers } from "@/lib/admin/team";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team · Admin", robots: { index: false, follow: false } };

const rolePill: Record<string, string> = {
  owner: "bg-indigo-50 text-indigo-700",
  superadmin: "bg-violet-50 text-violet-700",
  admin: "bg-sky-50 text-sky-700",
  volunteer: "bg-zinc-100 text-zinc-700",
};
const d = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" });

export default async function TeamPage() {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  const me = await currentAdmin();
  if (!me) redirect(base);
  const members = await listMembers();

  return (
    <AdminChrome base={base} user={me} active="team">
      <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Owners are set in the server config. Volunteers can&apos;t open this dashboard; they&apos;re for the check-in app.
      </p>

      <div className="mt-8">
        <InviteForm roles={invitableBy[me.role]} />
      </div>

      {/* Mobile: member cards */}
      <ul className="mt-8 space-y-2 md:hidden">
        {members.length === 0 && <li className="rounded-2xl border border-zinc-200/80 px-5 py-12 text-center text-sm text-zinc-500">No team members yet. Add someone above.</li>}
        {members.map((m) => (
          <li key={m.id} className="rounded-2xl border border-zinc-200/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{m.name ?? m.email}</p>
                {m.name && <p className="truncate text-sm text-zinc-500">{m.email}</p>}
              </div>
              <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${rolePill[m.role]}`}>{roleLabel[m.role]}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className={m.activated_at ? "text-emerald-700" : m.invite_expired ? "text-rose-600" : "text-yellow-700"}>
                {m.activated_at ? "Active" : m.invite_expired ? "Invite expired" : "Invited"}
                <span className="text-zinc-400"> · added by {m.invited_by ?? "—"}</span>
              </span>
              <div className="flex gap-1">
                {!m.activated_at && invitableBy[me.role].includes(m.role) && <ReissueButton id={m.id} />}
                {canRemove(me.role, m.role) && m.email !== me.email && <RemoveButton id={m.id} email={m.email} />}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-zinc-200/80 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-[13px] text-zinc-500">
              <tr className="border-b border-zinc-100">
                <th className="px-5 py-3.5 font-normal">Member</th>
                <th className="px-4 py-3.5 font-normal">Role</th>
                <th className="px-4 py-3.5 font-normal">Status</th>
                <th className="px-4 py-3.5 font-normal">Added by</th>
                <th className="px-5 py-3.5 font-normal">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-zinc-500">
                    No team members yet. Add someone above.
                  </td>
                </tr>
              )}
              {members.map((m) => {
                const expired = m.invite_expired;
                return (
                  <tr key={m.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium">{m.name ?? m.email}</p>
                      {m.name && <p className="text-xs text-zinc-500">{m.email}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${rolePill[m.role]}`}>{roleLabel[m.role]}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {m.activated_at ? (
                        <span className="text-emerald-700">Active</span>
                      ) : expired ? (
                        <span className="text-rose-600">Invite expired</span>
                      ) : (
                        <span className="text-yellow-700">Invited</span>
                      )}
                      <p className="text-xs text-zinc-400">{d.format(new Date(m.activated_at ?? m.created_at))}</p>
                    </td>
                    <td className="px-4 py-4 text-zinc-500">{m.invited_by ?? "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        {!m.activated_at && invitableBy[me.role].includes(m.role) && <ReissueButton id={m.id} />}
                        {canRemove(me.role, m.role) && m.email !== me.email && <RemoveButton id={m.id} email={m.email} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminChrome>
  );
}

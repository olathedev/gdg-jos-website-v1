import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopStrip, Wordmark } from "@/components/admin/Chrome";
import { AcceptInviteForm } from "@/components/admin/TeamForms";
import { adminEnabled, adminPath, roleLabel } from "@/lib/admin/auth";
import { findInvite } from "@/lib/admin/team";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Join the team · Admin", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  if (!adminEnabled()) notFound();
  const { token } = await params;
  const invite = await findInvite(token);
  const base = `/${adminPath()}`;

  return (
    <div className="flex min-h-svh flex-col bg-white font-sans text-ink">
      <TopStrip />
      <main className="grid flex-1 place-items-center px-4 py-12">
        <div className="w-full max-w-[22rem]">
          <div className="mb-8 flex justify-center">
            <Wordmark />
          </div>
          {invite ? (
            <>
              <h1 className="text-center text-2xl font-semibold tracking-tight">Join the team</h1>
              <p className="mt-1.5 mb-8 text-center text-sm text-zinc-500">
                {invite.name ? `${invite.name}, you` : "You"}&apos;ve been added as <strong className="font-medium text-ink">{roleLabel[invite.role]}</strong> ({invite.email}). Set a password to finish.
              </p>
              <AcceptInviteForm token={token} loginHref={base} email={invite.email} />
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
              <p className="mt-2 text-sm text-zinc-500">This invite link has expired or was already used. Ask whoever added you for a new one.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import MeetAuto from "@/components/quest/MeetAuto";
import { GameAvatar, gameBtn } from "@/components/quest/ui";
import { getMe } from "@/lib/quest/auth";
import { agentByToken } from "@/lib/quest/game";
import { hasSocial } from "@/lib/quest/validate";

export const metadata = { title: "Padi Up", robots: { index: false } };

/** Opened by scanning someone's Quest QR, in the app or with the phone camera. */
export default async function Meet({ params }: PageProps<"/quest/meet/[token]">) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) notFound();
  const me = await getMe();
  if (!me) redirect(`/quest?next=${encodeURIComponent(`/quest/meet/${token}`)}`);
  if (!me.onboarded_at || !me.avatar) redirect("/quest/setup");
  if (!hasSocial(me)) redirect(`/quest/setup?need=social&next=${encodeURIComponent(`/quest/meet/${token}`)}`);

  const other = await agentByToken(token);
  if (!other) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-4 pb-12">
      {other.id === me.id ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
          <GameAvatar avatar={me.avatar} size={84} />
          <h1 className="type-heading text-2xl font-bold">That&apos;s you!</h1>
          <p className="max-w-xs text-sm text-white/65">Show your QR to other players so they can scan it.</p>
          <Link href="/quest/home" className={gameBtn}>
            Back home
          </Link>
        </div>
      ) : (
        <MeetAuto token={token} avatar={other.avatar} />
      )}
    </main>
  );
}

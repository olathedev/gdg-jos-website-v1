import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StageBadge } from "@/components/quest/icons";
import SquadQuiz from "@/components/quest/SquadQuiz";
import { GameAvatar, gameBtn } from "@/components/quest/ui";
import { getMe } from "@/lib/quest/auth";
import { POINTS } from "@/lib/quest/config";
import { agentByToken } from "@/lib/quest/game";
import { squadView } from "@/lib/quest/stages";

export const metadata = { title: "Squad Up", robots: { index: false } };

function Message({ mark, title, text }: { mark: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <span aria-hidden>{mark}</span>
      <h1 className="type-heading text-2xl font-bold">{title}</h1>
      <p className="max-w-xs text-sm text-white/65">{text}</p>
      <Link href="/quest/home" className={gameBtn}>
        Back to the map
      </Link>
    </div>
  );
}

/** Opened by scanning someone's Quest QR with the phone camera. */
export default async function Meet({ params }: PageProps<"/quest/meet/[token]">) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) notFound();
  const me = await getMe();
  if (!me) redirect(`/quest?next=${encodeURIComponent(`/quest/meet/${token}`)}`);
  if (!me.onboarded_at || !me.avatar || !me.fun_fact) redirect("/quest/setup");

  const other = await agentByToken(token);
  if (!other) notFound();
  const view = await squadView(me, other);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-4 pb-12">
      {view.kind === "self" ? (
        <Message mark={<GameAvatar avatar={me.avatar} size={84} />} title="That's you!" text="Show your QR to other players so they can scan it." />
      ) : view.kind === "locked" ? (
        <Message mark={<StageBadge id="squad" color="#EA4335" size={80} locked />} title="Not yet" text={view.message} />
      ) : view.kind === "blocked" ? (
        <Message mark={<StageBadge id="squad" color="#EA4335" size={80} locked />} title="Can't lock in" text="You can't lock in this player." />
      ) : view.kind === "done" ? (
        <Message mark={<GameAvatar avatar={other.avatar} size={84} />} title="Already in your squad" text="Each player locks in once. Go find someone new." />
      ) : (
        <SquadQuiz
          token={token}
          avatar={other.avatar}
          questions={view.questions}
          retryIn={view.retryIn}
          header={
            <div className="flex flex-col items-center gap-2 pt-2 text-center">
              <span className="text-[11px] font-bold tracking-[0.2em] text-g-red">STAGE 2 · SQUAD UP</span>
              <GameAvatar avatar={other.avatar} size={96} className="quest-pop shadow-[0_6px_0_rgb(0_0_0/0.35)]" />
              <h1 className="type-heading text-2xl font-bold">Who&apos;s this player?</h1>
              <p className="max-w-xs text-sm text-white/65">Get all 3 right to lock them into your squad for +{POINTS.meet}. Not sure? Ask them.</p>
            </div>
          }
        />
      )}
    </main>
  );
}

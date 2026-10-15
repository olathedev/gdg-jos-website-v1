import { notFound, redirect } from "next/navigation";
import MeetConfirm from "@/components/quest/MeetConfirm";
import { Avatar, Logo, StackTag } from "@/components/quest/ui";
import { getMe } from "@/lib/quest/auth";
import { POINTS } from "@/lib/quest/config";
import { agentByToken, hasMet } from "@/lib/quest/game";
import { phase } from "@/lib/quest/time";
import { displayName, initials } from "@/lib/quest/validate";

export const metadata = { title: "Meet an agent", robots: { index: false } };

/** Opened by scanning someone's Agent QR with the phone camera. */
export default async function Meet({ params }: PageProps<"/quest/meet/[token]">) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) notFound();
  const me = await getMe();
  if (!me) redirect(`/quest?next=${encodeURIComponent(`/quest/meet/${token}`)}`);
  if (!me.onboarded_at) redirect("/quest/setup");

  const other = await agentByToken(token);
  if (!other) notFound();
  const name = displayName(other.full_name, other.is_adult);
  const self = other.id === me.id;
  const met = !self && (await hasMet(me.id, other.id));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-5 pb-10">
      <Logo />
      <div className="flex flex-col items-center gap-3 rounded-[28px_72px_28px_28px] bg-white p-7 text-center">
        <Avatar id={other.id} initials={initials(other.is_adult ? other.full_name : name)} size={72} />
        <h1 className="type-heading text-3xl font-bold">{name}</h1>
        {other.stack.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {other.stack.map((s) => (
              <StackTag key={s} label={s} />
            ))}
          </div>
        )}
      </div>
      {self ? (
        <p className="rounded-3xl bg-p-yellow px-5 py-4 text-center text-[15px]">
          That&apos;s your own code. Show it to another agent so they can scan it.
        </p>
      ) : phase() !== "event" ? (
        <p className="rounded-3xl bg-p-blue px-5 py-4 text-center text-[15px]">
          Meeting in person scores on 17 Oct at the venue. Scan {name} again then for +{POINTS.meet} each.
        </p>
      ) : met ? (
        <p className="rounded-3xl bg-p-green px-5 py-4 text-center text-[15px] font-semibold">
          You and {name} already met. Each pair scores once.
        </p>
      ) : (
        <MeetConfirm token={token} name={name} />
      )}
    </main>
  );
}

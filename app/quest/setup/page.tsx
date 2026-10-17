import Link from "next/link";
import { signOutAction } from "@/app/quest/actions";
import PlayerForm from "@/components/quest/PlayerForm";
import { requireMe, safeNext } from "@/lib/quest/auth";

export const metadata = { title: "Your player card", robots: { index: false } };

export default async function Setup({ searchParams }: PageProps<"/quest/setup">) {
  const me = await requireMe();
  const sp = await searchParams;
  const needSocial = sp.need === "social";
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  const ready = Boolean(me.onboarded_at && me.avatar);
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-12">
      <div className="flex items-center justify-between">
        {ready ? (
          <Link href="/quest/profile" className="flex min-h-11 items-center text-sm font-bold text-white/60 hover:text-white">
            Back
          </Link>
        ) : (
          <form action={signOutAction}>
            <button className="flex min-h-11 items-center text-sm font-bold text-white/60 hover:text-white">Sign out</button>
          </form>
        )}
        <span className="text-[11px] font-bold tracking-[0.2em] text-h-yellow">{ready ? "EDIT CARD" : "CREATE PLAYER"}</span>
      </div>
      {needSocial && (
        <p role="status" className="rounded-[20px] border border-h-yellow/40 bg-[#17140A] px-4 py-3 text-sm leading-relaxed">
          <span className="font-bold text-h-yellow">One quick thing.</span> Add a GitHub, LinkedIn, X or Instagram username so
          your padis can find you, then you&apos;re straight back in.
        </p>
      )}
      <PlayerForm
        next={next}
        initial={{
          full_name: me.full_name,
          avatar: me.avatar,
          stack: me.stack,
          fun_fact: me.fun_fact,
          github: me.github,
          linkedin: me.linkedin,
          x_handle: me.x_handle,
          instagram: me.instagram,
          whatsapp: me.whatsapp,
          share_whatsapp: me.share_whatsapp,
          hidden: me.hidden,
          onboarded: ready,
        }}
      />
    </main>
  );
}

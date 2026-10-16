import Link from "next/link";
import { signOutAction } from "@/app/quest/actions";
import PlayerForm from "@/components/quest/PlayerForm";
import { requireMe } from "@/lib/quest/auth";

export const metadata = { title: "Your player card", robots: { index: false } };

export default async function Setup() {
  const me = await requireMe();
  const ready = Boolean(me.onboarded_at && me.avatar && me.fun_fact);
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-12">
      <div className="flex items-center justify-between">
        {ready ? (
          <Link href="/quest/me" className="flex min-h-11 items-center text-sm font-bold text-white/60 hover:text-white">
            Back
          </Link>
        ) : (
          <form action={signOutAction}>
            <button className="flex min-h-11 items-center text-sm font-bold text-white/60 hover:text-white">Sign out</button>
          </form>
        )}
        <span className="text-[11px] font-bold tracking-[0.2em] text-h-yellow">{ready ? "EDIT CARD" : "CREATE PLAYER"}</span>
      </div>
      <PlayerForm
        initial={{
          full_name: me.full_name,
          avatar: me.avatar,
          stack: me.stack,
          fun_fact: me.fun_fact,
          onboarded: ready,
        }}
      />
    </main>
  );
}

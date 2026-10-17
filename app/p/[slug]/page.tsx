import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActiveDot from "@/components/quest/ActiveDot";
import PadiButton from "@/components/quest/PadiButton";
import { GameAvatar, gameBtnGhost, stackStyle } from "@/components/quest/ui";
import { getMe } from "@/lib/quest/auth";
import { profileBySlug, SLUG } from "@/lib/quest/profiles";
import { serverNow } from "@/lib/quest/time";
import { hasSocial } from "@/lib/quest/validate";

export const metadata = { title: "Profile" };

/** A shared profile link. Visitors sign in first and come back here. */
export default async function ProfileLink({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  if (!SLUG.test(slug)) notFound();
  const here = `/p/${slug}`;
  const me = await getMe();
  if (!me) redirect(`/quest?next=${encodeURIComponent(here)}`);
  if (!me.onboarded_at || !me.avatar) redirect(`/quest/setup?next=${encodeURIComponent(here)}`);
  if (!hasSocial(me)) redirect(`/quest/setup?need=social&next=${encodeURIComponent(here)}`);

  const p = await profileBySlug(slug, me.id);
  if (p === "self") redirect("/quest/profile");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      {!p ? (
        <>
          <h1 className="type-heading text-2xl font-bold">This profile isn&apos;t available</h1>
          <p className="max-w-xs text-sm text-white/60">The link may be wrong, or the person isn&apos;t showing their profile.</p>
        </>
      ) : (
        <section className="flex w-full flex-col items-center gap-3 rounded-[28px] border border-white/[0.08] bg-[#121212] px-5 pt-8 pb-6">
          <GameAvatar avatar={p.avatar} initials={p.initials} size={104} />
          <h1 className="type-heading text-[28px] leading-tight font-bold">{p.name}</h1>
          <ActiveDot at={p.lastActive} now={serverNow()} />
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s} className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-bold">
                <span aria-hidden className="size-1.5 rounded-full" style={{ background: stackStyle(s).color }} />
                {s}
              </li>
            ))}
          </ul>
          {p.funFact && <p className="max-w-xs text-[15px] leading-snug text-white/80">{p.funFact}</p>}
          <div className="mt-3 w-full">
            <PadiButton id={p.id} initial={p.state} />
          </div>
        </section>
      )}
      <Link href="/quest/home" className={gameBtnGhost}>
        Open PadiUp
      </Link>
    </main>
  );
}

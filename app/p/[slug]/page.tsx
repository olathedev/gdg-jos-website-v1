import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActiveDot from "@/components/quest/ActiveDot";
import PadiButton from "@/components/quest/PadiButton";
import { GameAvatar, gameBtnGhost, stackStyle } from "@/components/quest/ui";
import { getMe } from "@/lib/quest/auth";
import { inviteBySlug, profileBySlug, SLUG } from "@/lib/quest/profiles";
import { serverNow } from "@/lib/quest/time";
import { hasSocial } from "@/lib/quest/validate";

const GENERIC = "Join PadiUp at DevFest Jos 2026";
const DESCRIPTION = "The DevFest Jos game: meet people, become padis and climb the leaderboard.";

/** Link previews show the first name only, and nothing for hidden or under-18 players. */
export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const invite = SLUG.test(slug) ? await inviteBySlug(slug) : null;
  const title = invite?.firstName ? `Join ${invite.firstName} on PadiUp` : GENERIC;
  return {
    title: { absolute: title },
    description: DESCRIPTION,
    openGraph: { title, description: DESCRIPTION, type: "website" },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}

/** A shared profile link, which is also the owner's invite link. Visitors sign in first and come back here. */
export default async function ProfileLink({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  if (!SLUG.test(slug)) notFound();
  const here = `/p/${slug}`;
  const me = await getMe();
  if (!me) return <SignedOut slug={slug} here={here} />;
  if (!me.onboarded_at || !me.avatar) redirect(`/quest/setup?next=${encodeURIComponent(here)}`);
  if (!hasSocial(me)) redirect(`/quest/setup?need=social&next=${encodeURIComponent(here)}`);

  const p = await profileBySlug(slug, me.id);
  if (p === "self") redirect("/quest/profile");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      {!p ? (
        <>
          <h1 className="type-heading text-2xl font-bold">This profile isn&apos;t available</h1>
          <p className="max-w-xs text-sm text-fg/60">The link may be wrong, or the person isn&apos;t showing their profile.</p>
        </>
      ) : (
        <section className="flex w-full flex-col items-center gap-3 rounded-[28px] border border-fg/[0.08] bg-surface px-5 pt-8 pb-6">
          <GameAvatar avatar={p.avatar} initials={p.initials} size={104} />
          <h1 className="type-heading text-[28px] leading-tight font-bold">{p.name}</h1>
          <ActiveDot at={p.lastActive} now={serverNow()} />
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s} className="flex items-center gap-1.5 rounded-full border border-fg/15 px-3 py-1 text-xs font-bold">
                <span aria-hidden className="size-1.5 rounded-full" style={{ background: stackStyle(s).color }} />
                {s}
              </li>
            ))}
          </ul>
          {p.funFact && <p className="max-w-xs text-[15px] leading-snug text-fg/80">{p.funFact}</p>}
          <div className="mt-3 w-full">
            <PadiButton id={p.id} initial={p.state} name={p.name} />
          </div>
        </section>
      )}
      <Link href="/quest/home" className={gameBtnGhost}>
        Open PadiUp
      </Link>
    </main>
  );
}

/**
 * Signed out: a page of its own (not a redirect) so link previews read this page's tags.
 * Signing in through it records the owner as the person who invited you, on first sign-up only.
 */
async function SignedOut({ slug, here }: { slug: string; here: string }) {
  const invite = await inviteBySlug(slug);
  const start = `/quest/auth/google?${new URLSearchParams({ ...(invite?.inviteCode && { ref: invite.inviteCode }), next: here })}`;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <p className="text-xs font-bold tracking-[0.18em] text-fg/60">DEVFEST JOS 2026</p>
      <h1 className="type-heading text-[32px] leading-tight font-bold">
        {invite?.firstName ? `${invite.firstName} wants to be your padi` : "You're invited to PadiUp"}
      </h1>
      <p className="max-w-xs text-[15px] leading-snug text-fg/75">{DESCRIPTION} Sign in to see their profile.</p>
      <a
        href={start}
        className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-ink/10 bg-white text-base font-bold text-ink transition-colors hover:bg-white/85"
      >
        <span aria-hidden className="grid grid-cols-2 gap-0.5">
          <span className="size-2 rounded-full bg-g-blue" />
          <span className="size-2 rounded-full bg-g-red" />
          <span className="size-2 rounded-full bg-g-yellow" />
          <span className="size-2 rounded-full bg-g-green" />
        </span>
        Continue with Google
      </a>
    </main>
  );
}

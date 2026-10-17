import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { gameBtn } from "@/components/quest/ui";
import { getMe } from "@/lib/quest/auth";
import { getCircle } from "@/lib/quest/circles";
import { GROUP_LABEL } from "@/lib/quest/roles";

const DESCRIPTION = "The DevFest Jos game: meet people, become padis and climb the leaderboard.";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const circle = await getCircle((await params).slug);
  const title = circle ? `Join the ${circle.name} ${GROUP_LABEL.one} on PadiUp` : "Join PadiUp";
  return {
    title: { absolute: title },
    description: DESCRIPTION,
    openGraph: { title, description: DESCRIPTION, type: "website" },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}

/**
 * A circle's join link. Signed out: sign in (an invite code in ?ref= is kept) and come back.
 * Signed in: everyone with a profile is a member, so straight to Home with a welcome.
 */
export default async function JoinCircle({ params, searchParams }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const circle = await getCircle(slug);
  if (!circle) notFound();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const invite = one(sp.invite);
  const me = await getMe();

  if (me && invite !== "inactive" && invite !== "slow") {
    redirect(me.onboarded_at ? "/quest/home?welcome=circle" : "/quest/setup?next=%2Fquest%2Fhome%3Fwelcome%3Dcircle");
  }

  const ref = one(sp.ref)?.match(/^[A-Za-z0-9_-]{4,16}$/)?.[0];
  const start = `/quest/auth/google?${new URLSearchParams({ ...(ref && { ref }), next: `/c/${circle.slug}` })}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <p className="text-xs font-bold tracking-[0.18em] text-fg/60">PADIUP · {circle.name.toUpperCase()}</p>
      {invite === "inactive" || invite === "slow" ? (
        <>
          <h1 className="type-heading text-[30px] leading-tight font-bold">This invite link is no longer active</h1>
          <p className="max-w-xs text-[15px] leading-snug text-fg/75">
            {invite === "slow"
              ? "Too many links tried in a short time. Wait a few minutes and try again."
              : "It may have expired, been switched off or used up. Ask the organiser for a new one. You can still join as an attendee."}
          </p>
          <Link href={me?.onboarded_at ? "/quest/home?welcome=circle" : start} className={`${gameBtn} w-full`}>
            Join {circle.name}
          </Link>
        </>
      ) : (
        <>
          <h1 className="type-heading text-[32px] leading-tight font-bold">
            Join the {circle.name} {GROUP_LABEL.one}
          </h1>
          <p className="max-w-xs text-[15px] leading-snug text-fg/75">{DESCRIPTION}</p>
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
        </>
      )}
    </main>
  );
}

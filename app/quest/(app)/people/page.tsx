import Link from "next/link";
import PeopleList from "@/components/quest/PeopleList";
import { requireAgent } from "@/lib/quest/auth";
import { directory } from "@/lib/quest/game";

export const metadata = { title: "People" };

export default async function People() {
  const me = await requireAgent();
  const people = me.is_adult ? await directory(me.id) : [];

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="flex flex-col gap-1">
        <h1 className="type-heading text-[26px] leading-tight font-bold">
          People <span className="text-white/35">· {people.length}</span>
        </h1>
        <p className="text-sm text-white/60">Everyone at DevFest Jos who chose to be listed. Send a padi request to swap socials.</p>
      </header>

      {!me.is_adult ? (
        <p className="rounded-[24px] border border-white/[0.08] bg-[#121212] px-5 py-8 text-center text-sm text-white/65">
          The directory is for players 18 and over. You can still scan people at the venue, play every stage and climb the board.
        </p>
      ) : (
        <>
          {!me.listed && (
            <Link
              href="/quest/setup"
              className="rounded-full border border-h-yellow/40 bg-h-yellow/10 px-4 py-2.5 text-center text-sm font-bold text-h-yellow"
            >
              You&apos;re hidden. Turn on &ldquo;Show me in the directory&rdquo; to be found.
            </Link>
          )}
          <PeopleList people={people} canConnect={me.is_adult} />
        </>
      )}
    </div>
  );
}

import PeopleList from "@/components/quest/PeopleList";
import { requireAgent } from "@/lib/quest/auth";
import { directory } from "@/lib/quest/game";
import { serverNow } from "@/lib/quest/time";

export const metadata = { title: "People" };

export default async function People() {
  const me = await requireAgent();
  const people = await directory(me.id);
  const now = serverNow();

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="flex flex-col gap-1">
        <h1 className="type-heading text-[26px] leading-tight font-bold">
          People <span className="text-white/35">· {people.length}</span>
        </h1>
        <p className="text-sm text-white/60">Everyone playing at DevFest Jos. Send a padi request to swap socials.</p>
      </header>
      <PeopleList people={people} canConnect now={now} />
    </div>
  );
}

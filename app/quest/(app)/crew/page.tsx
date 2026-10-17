import CrewList from "@/components/quest/CrewList";
import { requireAgent } from "@/lib/quest/auth";
import { crew } from "@/lib/quest/game";

export const metadata = { title: "Padis" };

export default async function Crew() {
  const me = await requireAgent();
  const { pending, connected } = await crew(me.id);
  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="flex flex-col gap-1">
        <h1 className="type-heading text-[26px] leading-tight font-bold">Padis</h1>
        <p className="text-sm text-white/60">People you&apos;ve connected with. Their socials show here once you&apos;re padis.</p>
      </header>
      <CrewList pending={pending} connected={connected} />
    </div>
  );
}

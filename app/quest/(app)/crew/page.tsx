import Link from "next/link";
import CrewList from "@/components/quest/CrewList";
import { requireAgent } from "@/lib/quest/auth";
import { crew } from "@/lib/quest/game";

export const metadata = { title: "Your crew" };

export default async function Crew() {
  const me = await requireAgent();
  const { pending, connected } = await crew(me.id);
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Link href="/quest/people" className="flex min-h-11 items-center self-start text-sm font-semibold">
        Who&apos;s coming
      </Link>
      <h1 className="type-heading text-[38px] leading-none font-bold lg:text-5xl">
        Your <span className="text-g-red">crew</span>
      </h1>
      <CrewList pending={pending} connected={connected} />
    </div>
  );
}

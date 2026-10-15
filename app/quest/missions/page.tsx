import Link from "next/link";
import Missions from "@/components/quest/Missions";
import { pillDark } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { missions } from "@/lib/quest/game";

export const metadata = { title: "Power up your agent", robots: { index: false } };

export default async function MissionsPage({ searchParams }: PageProps<"/quest/missions">) {
  const me = await requireAgent();
  const welcome = (await searchParams).welcome === "1";
  const m = await missions(me.id);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-5 pb-10 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:pt-10">
      <div className="flex items-center justify-between">
        <Link href={welcome ? "/quest/setup" : "/quest/home"} className="flex min-h-11 items-center text-sm font-semibold">
          Back
        </Link>
        {welcome && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold">Step 2 of 2</span>}
      </div>
      <h1 className="type-heading text-[38px] leading-none font-bold lg:text-5xl">
        Power up your <span className="text-g-yellow">agent</span>
      </h1>
      <div className="relative flex items-center gap-3.5 overflow-hidden rounded-[28px] bg-ink p-5 text-white">
        <span aria-hidden className="absolute -top-3.5 -right-4 size-[90px] rounded-full bg-[#2A2A2A]" />
        <span className="type-heading relative text-5xl font-bold text-h-yellow">+{m.earned}</span>
        <span className="relative text-sm leading-normal text-[#E0E0E0]">
          bonus points so far. Missions are optional; you can finish them later from Home.
        </span>
      </div>
      <Missions
        followed={m.followed}
        community={m.community}
        postsToday={m.postsToday}
        pendingPosts={m.pendingPosts}
        hasX={Boolean(me.x_handle)}
      />
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <Link href="/quest/home" className={`${pillDark} min-h-14 text-base lg:px-10`}>
          {welcome ? "Enter Agent Mode" : "Back to Home"}
        </Link>
        {welcome && (
          <Link href="/quest/home" className="flex min-h-11 items-center justify-center px-5 text-sm font-semibold text-[#5F5F5F]">
            Skip for now
          </Link>
        )}
      </div>
    </main>
  );
}

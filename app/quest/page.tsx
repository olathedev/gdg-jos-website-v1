import { redirect } from "next/navigation";
import { StageBadge } from "@/components/quest/icons";
import { Dots, Logo } from "@/components/quest/ui";
import { STAGES } from "@/lib/quest/config";
import { event } from "@/data/devfest26";
import { getMe, safeNext } from "@/lib/quest/auth";

function Shapes() {
  return (
    <div aria-hidden className="relative h-32 lg:h-56">
      <span className="absolute top-[34px] left-[4%] h-[34px] w-28 -rotate-[18deg] rounded-full bg-g-blue lg:h-12 lg:w-40" />
      <span className="absolute top-[88px] left-[18%] h-6 w-16 rotate-[9deg] rounded-full bg-h-red lg:top-36" />
      <span className="absolute top-[58px] left-[34%] size-[46px] rounded-full bg-g-yellow lg:size-16" />
      <span className="absolute top-1 left-[48%] text-[52px] leading-none font-bold text-g-green lg:text-[80px]">{"{ }"}</span>
      <span className="absolute top-[76px] left-[73%] h-[30px] w-[92px] rotate-[14deg] rounded-full bg-g-red lg:top-36" />
      <span className="absolute top-4 left-[77%] size-[34px] rounded-full bg-h-blue" />
      <span className="absolute top-[30px] left-[90%] size-[52px] rotate-[20deg] rounded-[14px] bg-h-green" />
    </div>
  );
}

export default async function Welcome({ searchParams }: PageProps<"/quest">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const ref = one(sp.ref)?.match(/^[A-Za-z0-9_-]{4,16}$/)?.[0];
  const next = safeNext(one(sp.next));

  const me = await getMe();
  if (me) redirect(me.onboarded_at ? (next ?? "/quest/home") : "/quest/setup");

  const start = `/quest/auth/google?${new URLSearchParams({ ...(ref && { ref }), ...(next && { next }) })}`;

  return (
    <main className="min-h-dvh overflow-hidden text-white">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-6 pt-6 pb-7 lg:grid lg:max-w-6xl lg:grid-cols-2 lg:content-center lg:gap-x-16 lg:gap-y-6 lg:px-10">
        <Logo dark className="lg:col-start-1" />
        <div className="-mx-6 lg:hidden">
          <Shapes />
        </div>
        <div className="flex flex-col gap-2.5 lg:col-start-1">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[#BDBDBD]">
            <Dots />
            THE DEVFEST JOS GAME
          </p>
          <h1 className="type-heading text-[36px] leading-[1.02] font-bold lg:text-5xl">
            DevFest <span className="text-h-blue">Quest</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-[#E0E0E0] lg:text-lg">
            Four stages. One leaderboard. Pick your avatar, clear every stage and win prizes on stage at DevFest Jos.
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:gap-3 lg:self-center">
          <div className="hidden lg:block">
            <Shapes />
          </div>
          <ol className="flex flex-col gap-1 rounded-[24px] border border-white/[0.08] bg-[#121212] p-2">
            {STAGES.map((st) => (
              <li key={st.id} className="flex items-center gap-3.5 rounded-2xl px-2 py-2">
                <span aria-hidden className="flex w-12 justify-center">
                  <StageBadge id={st.id} color={st.color} size={st.id === "partners" ? 34 : 40} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: st.color }}>
                    STAGE {st.num}
                  </span>
                  <span className="text-[15px] font-bold lg:text-base">{st.title}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="self-start rounded-full border border-white/[0.08] bg-[#121212] px-3.5 py-2 text-[13px] text-[#E0E0E0]">
            {event.dateLabel} · {event.venue}, {event.city}
          </p>
        </div>

        {sp.error && (
          <p role="alert" className="rounded-2xl bg-g-red/20 px-4 py-3 text-sm text-white lg:col-start-1">
            Sign-in didn&apos;t finish. Try again.
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3 pt-2 lg:col-start-1 lg:mt-0 lg:max-w-sm">
          <a
            href={start}
            className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-white text-base font-bold text-ink transition-colors hover:bg-white/85"
          >
            <span aria-hidden className="grid grid-cols-2 gap-0.5">
              <span className="size-2 rounded-full bg-g-blue" />
              <span className="size-2 rounded-full bg-g-red" />
              <span className="size-2 rounded-full bg-g-yellow" />
              <span className="size-2 rounded-full bg-g-green" />
            </span>
            Continue with Google
          </a>
          <p className="text-center text-[12.5px] leading-normal text-[#BDBDBD] lg:text-left">
            Free and VIP attendees play equally.
          </p>
        </div>
      </div>
    </main>
  );
}

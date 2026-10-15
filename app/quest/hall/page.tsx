import { notFound } from "next/navigation";
import AutoRefresh from "@/components/quest/AutoRefresh";
import HallQr from "@/components/quest/HallQr";
import { Logo } from "@/components/quest/ui";
import { POINTS } from "@/lib/quest/config";
import { hallKeyValid } from "@/lib/quest/entrance";
import { leaderboard } from "@/lib/quest/points";

export const metadata = { title: "Hall screen", robots: { index: false } };

const medals = ["bg-h-yellow text-ink", "bg-p-blue text-ink", "bg-p-red text-ink"];

/** Full-screen board for the venue screens: /quest/hall?key=<QUEST_HALL_KEY>. */
export default async function Hall({ searchParams }: PageProps<"/quest/hall">) {
  const key = (await searchParams).key;
  if (typeof key !== "string" || !hallKeyValid(key)) notFound();
  const { rows } = await leaderboard();
  const top = rows.slice(0, 10);

  return (
    <main className="relative grid min-h-dvh grid-cols-[minmax(0,1fr)_minmax(320px,30vw)] gap-[4vw] overflow-hidden bg-ink px-[4.4vw] py-[6vh] text-white">
      <AutoRefresh seconds={30} />
      <span aria-hidden className="absolute -top-5 left-[47%] h-11 w-[150px] -rotate-16 rounded-full bg-g-blue" />
      <span aria-hidden className="absolute top-6 left-[61%] size-10 rounded-full bg-g-yellow" />
      <span aria-hidden className="absolute -bottom-6 left-[42%] h-10 w-[120px] rotate-12 rounded-full bg-g-red" />
      <span aria-hidden className="absolute bottom-8 left-[55%] size-[46px] rotate-20 rounded-[14px] bg-h-green" />

      <div className="relative flex min-w-0 flex-col gap-[2.5vh]">
        <div className="flex items-center gap-3 text-2xl">
          <Logo dark className="[&>span:first-child]:text-2xl" />
          <span className="ml-2 text-base font-bold tracking-wide text-h-blue">AGENT MODE</span>
        </div>
        <h1 className="type-heading text-[clamp(40px,4.5vw,72px)] leading-none font-bold">
          Top agents <span className="text-h-yellow">right now</span>
        </h1>
        {top.length ? (
          <ol className="grid grid-cols-2 gap-x-7">
            {top.map((r, i) => (
              <li key={r.id} className="flex items-center gap-3.5 border-b border-[#3A3A3A] py-[1.4vh]">
                <span
                  className={`flex size-[42px] shrink-0 items-center justify-center rounded-full text-lg font-bold ${medals[i] ?? "bg-[#3A3A3A]"}`}
                >
                  {r.rank}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[clamp(16px,1.6vw,24px)] font-bold">{r.name}</span>
                  <span className="truncate text-sm text-[#BDBDBD]">{r.stack.join(" · ")}</span>
                </span>
                <span className="type-heading text-[clamp(20px,2vw,30px)] font-bold">{r.score}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-2xl text-[#BDBDBD]">The board fills up as agents score. Check in to be first.</p>
        )}
        <p className="mt-auto self-start rounded-full bg-[#2A2A2A] px-[18px] py-2.5 text-[17px] text-[#E0E0E0]">
          Meet people: +{POINTS.meet} per scan · Scan room doors: +{POINTS.room} · Recap quizzes after each talk
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-3.5 self-center rounded-[32px_96px_32px_32px] bg-white p-8 text-center text-ink">
        <span className="type-heading text-[32px] leading-none font-bold">
          Just <span className="text-g-green">arrived?</span>
        </span>
        <span className="text-[17px] leading-snug text-textDark">Scan with your phone camera to check in and start playing.</span>
        <HallQr hallKey={key} />
      </div>
    </main>
  );
}

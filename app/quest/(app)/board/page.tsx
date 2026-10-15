import Link from "next/link";
import AutoRefresh from "@/components/quest/AutoRefresh";
import { Avatar } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { PRE_EVENT_CAP } from "@/lib/quest/config";
import { leaderboard, myScore, type BoardRow } from "@/lib/quest/points";
import { phase } from "@/lib/quest/time";

export const metadata = { title: "Leaderboard" };

const podium = [
  { place: 1, bg: "bg-p-blue", h: "h-20" },
  { place: 0, bg: "bg-h-yellow", h: "h-28" },
  { place: 2, bg: "bg-p-red", h: "h-14" },
];

function Step({ row, bg, h, rank }: { row?: BoardRow; bg: string; h: string; rank: number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      {row ? (
        <>
          <Avatar id={row.id} initials={row.initials} size={rank === 1 ? 56 : 46} className="border-[3px] border-white" />
          <span className="max-w-full truncate text-sm font-bold">{row.name}</span>
        </>
      ) : (
        <span className="text-sm text-[#5F5F5F]">Open</span>
      )}
      <div className={`flex w-full flex-col items-center justify-start gap-0.5 rounded-t-3xl pt-2.5 ${bg} ${h}`}>
        <span className="type-heading text-2xl font-bold">{rank}</span>
        {row && <span className="text-xs font-bold">{row.score} pts</span>}
      </div>
    </div>
  );
}

export default async function Board() {
  const me = await requireAgent();
  const [board, mine] = await Promise.all([leaderboard(), myScore(me.id)]);
  const rows = board.rows;
  const you = board.byId.get(me.id);
  const rest = rows.slice(3, 50);
  const pre = phase() === "pre";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <AutoRefresh seconds={30} />
      <div className="flex flex-col gap-4">
        <h1 className="type-heading text-[38px] leading-none font-bold lg:text-5xl">
          Top <span className="text-g-yellow">agents</span>
        </h1>
        <p className="text-sm leading-normal text-[#5F5F5F]">
          Updated every 30 seconds.{" "}
          {pre ? `Before 17 Oct points stop at ${PRE_EVENT_CAP}; ties go to whoever got there first.` : "Ties go to whoever got there first."}
        </p>
        <div className="flex items-end gap-2 rounded-3xl bg-white px-4 pt-5">
          {podium.map((p) => (
            <Step key={p.place} row={rows[p.place]} bg={p.bg} h={p.h} rank={p.place + 1} />
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-ink px-5 py-4 text-white lg:sticky lg:top-10">
          <span className="type-heading text-3xl font-bold text-h-yellow">{you ? `#${you.rank}` : "–"}</span>
          <span className="flex-1 text-[15px] font-semibold">You · {mine.score} points</span>
          <Link href="/quest/level-up" className="flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-bold text-ink">
            Earn more
          </Link>
        </div>
        <p className="text-[12.5px] leading-normal text-[#5F5F5F]">
          Winners show their ticket on stage to collect prizes. Under-18 agents appear by first name only.
        </p>
      </div>

      {rest.length > 0 ? (
        <ol start={4} className="self-start rounded-3xl bg-white px-[18px] py-1.5">
          {rest.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center gap-2.5 py-[11px] ${i ? "border-t border-[#EDEDED]" : ""} ${r.id === me.id ? "-mx-2 rounded-2xl bg-p-yellow px-2" : ""}`}
            >
              <span className="w-7 shrink-0 text-center text-[15px] font-bold text-[#5F5F5F]">{r.rank}</span>
              <Avatar id={r.id} initials={r.initials} size={36} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-bold">{r.name}</span>
                <span className="truncate text-xs text-[#5F5F5F]">{r.stack.join(" · ")}</span>
              </span>
              <span className="type-heading text-lg font-bold">{r.score}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="self-start rounded-3xl bg-white px-5 py-8 text-center text-[15px] text-[#5F5F5F]">
          {rows.length ? "Only the podium so far. Your spot is open." : "No points yet. Answer a Level Up card to get on the board."}
        </p>
      )}
    </div>
  );
}

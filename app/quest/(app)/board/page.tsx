import AutoRefresh from "@/components/quest/AutoRefresh";
import { PodiumGlyph } from "@/components/quest/icons";
import { GameAvatar, panel } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { PRE_EVENT_CAP } from "@/lib/quest/config";
import { leaderboard, myScore, type BoardRow } from "@/lib/quest/points";
import { phase } from "@/lib/quest/time";

export const metadata = { title: "Leaderboard" };

// Podium order on screen: 2nd, 1st, 3rd.
const podium = [
  { place: 2, h: "h-20", color: "#BDC1C6" },
  { place: 1, h: "h-28", color: "#F9AB00" },
  { place: 3, h: "h-14", color: "#E8A87C" },
];

function Step({ row, place, h, color }: { row?: BoardRow; place: number; h: string; color: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      {row ? (
        <>
          <GameAvatar
            avatar={row.avatar}
            initials={row.initials}
            size={place === 1 ? 64 : 52}
            className={place === 1 ? "quest-float" : ""}
          />
          <span className="max-w-full truncate text-sm font-bold">{row.name}</span>
        </>
      ) : (
        <span className="pb-2 text-sm text-fg/30">Open</span>
      )}
      <div
        className={`flex w-full flex-col items-center justify-start gap-0.5 rounded-t-2xl pt-2 text-ink ${h}`}
        style={{ background: row ? color : "rgb(var(--q-fg-rgb) / 0.06)" }}
      >
        <span className="type-heading text-xl font-bold">{place}</span>
        {row && <span className="text-xs font-black tabular-nums">{row.score}</span>}
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

  return (
    <div className="flex flex-col gap-6 pt-2">
      <AutoRefresh seconds={30} />
      <header className="flex flex-col items-center gap-1 text-center">
        <span aria-hidden className="mb-1 flex size-14 items-center justify-center rounded-full bg-h-yellow text-[#0A0A0A]">
          <PodiumGlyph size={28} />
        </span>
        <h1 className="type-heading text-[28px] font-bold">Leaderboard</h1>
        <p className="text-xs text-fg/50">
          {phase() === "pre" ? `Before 17 Oct scores stop at ${PRE_EVENT_CAP}. ` : ""}Ties go to whoever got there first.
        </p>
      </header>

      <div className="flex items-end gap-2">
        {podium.map((p) => (
          <Step key={p.place} row={rows[p.place - 1]} {...p} />
        ))}
      </div>

      <div className={`${panel} flex items-center gap-3 border-h-yellow/40 bg-h-yellow/10 px-4 py-3`}>
        <span className="type-heading w-12 text-xl font-bold text-hl">{you ? `#${you.rank}` : "–"}</span>
        <GameAvatar avatar={me.avatar} size={36} />
        <span className="flex-1 text-sm font-bold">You</span>
        <span className="text-sm font-black tabular-nums">{mine.score}</span>
      </div>

      {rest.length > 0 && (
        <ol className={`${panel} flex flex-col divide-y divide-fg/5 px-3`} start={4}>
          {rest.map((r) => (
            <li key={r.id} className={`flex items-center gap-3 py-2.5 ${r.id === me.id ? "text-hl" : ""}`}>
              <span className="w-8 text-center text-sm font-black text-fg/50 tabular-nums">{r.rank}</span>
              <GameAvatar avatar={r.avatar} initials={r.initials} size={32} />
              <span className="flex-1 truncate text-sm font-bold">{r.name}</span>
              <span className="text-sm font-black tabular-nums">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
      {rows.length === 0 && <p className={`${panel} px-5 py-8 text-center text-sm text-fg/60`}>No scores yet. Clear Stage 1 to get on the board.</p>}
      <p className="text-center text-xs text-fg/40">Winners show their ticket on stage to collect prizes.</p>
    </div>
  );
}

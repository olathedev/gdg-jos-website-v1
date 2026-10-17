import { ArrowRight, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LockGlyph, QrGlyph, RankBadge, ScanGlyph, StageBadge, StageGlyph } from "@/components/quest/icons";
import JoinGdg, { JoinWhatsApp } from "@/components/quest/JoinGdg";
import { GameAvatar, gameBtn, gameBtnGhost, panel } from "@/components/quest/ui";
import ShareProfile from "@/components/quest/ShareProfile";
import XPost from "@/components/quest/XPost";
import { adminSiteUrl } from "@/lib/admin/site";
import { requireAgent } from "@/lib/quest/auth";
import {
  FOLLOWS,
  PARTNER_GOAL,
  PARTNER_UNLOCK_PADIS,
  POINTS,
  ROUND_QUESTIONS,
  ROUND_TIME,
  SQUAD_GOAL,
  STAGES,
  type StageId,
} from "@/lib/quest/config";
import { leaderboard, myScore } from "@/lib/quest/points";
import { ensureSlug } from "@/lib/quest/profiles";
import { gameState, type StageState } from "@/lib/quest/stages";
import { displayName } from "@/lib/quest/validate";
import { db } from "@/lib/tickets/db";

export const metadata = { title: "Home" };

export default async function Home({ searchParams }: PageProps<"/quest/home">) {
  const me = await requireAgent();
  const welcome = (await searchParams).welcome === "1";
  const [{ score }, board, g, [{ pending, posted, joined, invited }], slug, site] = await Promise.all([
    myScore(me.id),
    leaderboard(),
    gameState(me.id),
    db()<{ pending: number; posted: boolean; joined: boolean; invited: number }[]>`
      select
        (select count(*)::int from quest_connections
          where (user_a = ${me.id} or user_b = ${me.id}) and status = 'pending' and requester <> ${me.id}) as pending,
        exists (select 1 from quest_x_posts where user_id = ${me.id} and status = 'counted') as posted,
        exists (select 1 from quest_points where user_id = ${me.id} and source_type = 'community') as joined,
        (select count(*)::int from quest_profiles where invited_by = ${me.id} and onboarded_at is not null) as invited`,
    ensureSlug(me),
    adminSiteUrl(),
  ]);
  const rank = board.byId.get(me.id)?.rank;
  const top = board.rows.slice(0, 3);
  const liveRound = g.rounds.find((r) => r.status === "live" && !r.played);
  const cleared = STAGES.filter((s) => g.states[s.id] === "done").length;
  const current = STAGES.find((s) => s.id === g.current)!;
  const first = me.full_name.trim().split(/\s+/)[0] || "player";

  const status = (id: StageId, s: StageState) => {
    if (s === "locked") {
      if (id !== "partners") return "Locked";
      return g.partnersOpen ? `${Math.min(g.counts.padis, PARTNER_UNLOCK_PADIS)}/${PARTNER_UNLOCK_PADIS} padis to unlock` : "Opens later";
    }
    if (id === "socials") return s === "done" ? "Cleared" : `${g.counts.follows}/${FOLLOWS.length} followed`;
    if (id === "padiup") return s === "done" ? `${g.counts.squad} connected` : `${g.counts.squad}/${SQUAD_GOAL} connected`;
    if (id === "quiz") {
      if (s === "live") return "A round is LIVE";
      const played = g.rounds.filter((r) => r.played).length;
      return played ? `${played}/3 rounds played` : "Waiting for round 1";
    }
    return s === "done" ? "Cleared" : `${g.counts.partners}/${PARTNER_GOAL} partners`;
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      {welcome && (
        <p role="status" className="quest-pop rounded-full border border-g-green/40 bg-g-green/10 px-4 py-2.5 text-center text-sm font-bold text-good">
          You&apos;re in! Tap Start the quest to begin.
        </p>
      )}

      {/* Score */}
      <section className="flex items-end justify-between gap-4" aria-label="Your score">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-fg/55">Hi {first}</span>
          <span className="type-heading quest-pop flex items-center gap-2 text-[52px] leading-none font-bold tabular-nums">
            <span aria-hidden className="text-g-blue">{"{"}</span>
            {score}
            <span aria-hidden className="text-g-yellow">{"}"}</span>
          </span>
          <span className="text-xs font-bold tracking-[0.18em] text-fg/40">POINTS</span>
        </div>
        <Link
          href="/quest/board"
          className="mb-1 flex items-center gap-1.5 rounded-full border border-fg/10 bg-surface-2 px-3.5 py-2 text-sm font-bold hover:bg-surface-3"
        >
          {rank ? `Rank #${rank}` : "Not ranked yet"}
          <ChevronRight aria-hidden className="size-4 text-fg/50" />
        </Link>
      </section>

      {/* Quest breadcrumb */}
      <nav aria-label="Your quest" className={`${panel} flex flex-col gap-3 p-4`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.2em] text-fg/45">YOUR QUEST</span>
          <span className="text-xs font-bold text-fg/60">{cleared}/4 cleared</span>
        </div>
        <ol className="flex items-start">
          {STAGES.map((st, i) => {
            const s = g.states[st.id];
            const here = st.id === g.current && s !== "done";
            return (
              <li key={st.id} className="flex flex-1 items-start">
                <Link
                  href={`/quest/stage/${st.id}`}
                  aria-current={here ? "step" : undefined}
                  aria-label={`Stage ${st.num}: ${st.title}. ${status(st.id, s)}`}
                  className="group flex w-full flex-col items-center gap-1.5 text-center"
                >
                  <span className={`relative flex h-11 items-center rounded-full ${here ? "ring-2 ring-fg ring-offset-2 ring-offset-surface" : ""}`}>
                    <StageBadge id={st.id} color={st.color} size={st.id === "partners" ? 34 : 42} locked={s === "locked"} />
                    {s === "done" && (
                      <span className="absolute -top-1 -right-1.5 flex size-5 items-center justify-center rounded-full border-2 border-surface bg-fg">
                        <Check aria-hidden className="size-3 text-on-fg" strokeWidth={4} />
                      </span>
                    )}
                    {s === "locked" && (
                      <span className="absolute -right-1.5 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-surface bg-surface-3 text-fg/70">
                        <LockGlyph size={10} />
                      </span>
                    )}
                  </span>
                  <span className={`text-[11px] leading-tight font-bold ${s === "locked" ? "text-fg/35" : here ? "text-fg" : "text-fg/70"}`}>
                    {st.short}
                  </span>
                </Link>
                {i < STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className="mt-[21px] h-0.5 w-3 shrink-0 rounded-full"
                    style={{ background: s === "done" ? st.color : "rgb(var(--q-fg-rgb) / 0.15)" }}
                  />
                )}
              </li>
            );
          })}
        </ol>
        <Link href="/quest/map" className={`${gameBtn} mt-1 min-h-12`}>
          {cleared === 0 ? "Start the quest" : cleared === 4 ? "View quest map" : "Continue quest"} <ArrowRight aria-hidden className="size-4" />
        </Link>
      </nav>

      {/* Live round */}
      {liveRound && g.states.quiz !== "locked" && (
        <Link
          href={`/quest/quiz/${liveRound.round}`}
          className="flex items-center gap-3 rounded-[24px] border border-h-yellow/50 bg-tint-yellow p-4 transition-transform active:scale-[0.98]"
        >
          <StageBadge id="quiz" color="#F9AB00" size={44} />
          <span className="flex flex-1 flex-col">
            <span className="text-[11px] font-black tracking-[0.15em] text-alert">LIVE NOW</span>
            <span className="text-[15px] font-bold">Brain Blitz · Round {liveRound.round}</span>
            <span className="text-xs text-fg/60">{ROUND_QUESTIONS} questions, {ROUND_TIME}. One shot.</span>
          </span>
          <ArrowRight aria-hidden className="size-5 text-hl" />
        </Link>
      )}

      {/* Padi requests */}
      {pending > 0 && (
        <Link
          href="/quest/crew"
          className="flex items-center gap-3 rounded-[24px] border border-g-red/40 bg-tint-red p-4 transition-transform active:scale-[0.98]"
        >
          <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-g-red text-white">
            <StageGlyph id="padiup" size={24} ink="currentColor" fill="transparent" />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-[15px] font-bold">
              {pending} padi {pending === 1 ? "request" : "requests"}
            </span>
            <span className="text-xs text-fg/60">Accept to swap socials</span>
          </span>
          <ArrowRight aria-hidden className="size-5 text-fg/60" />
        </Link>
      )}

      {/* Next up */}
      <section className={`${panel} flex flex-col gap-4 p-4`} aria-labelledby="next-h">
        <div className="flex items-center gap-3.5">
          <StageBadge id={current.id} color={current.color} size={current.id === "partners" ? 44 : 52} locked={g.states[current.id] === "locked"} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: `var(--q-st-${current.id})` }}>
              {cleared === 4 ? "ALL CLEARED" : `NEXT UP · STAGE ${current.num}`}
            </span>
            <h2 id="next-h" className="type-heading text-xl leading-tight font-bold">
              {current.title}
            </h2>
            <span className="text-sm text-fg/60">{status(current.id, g.states[current.id])}</span>
          </div>
        </div>
        {current.id === "padiup" ? (
          <Link href="/quest/scan" className={gameBtnGhost}>
            <ScanGlyph size={20} /> Scan a player
          </Link>
        ) : (
          <Link href={`/quest/stage/${current.id}`} className={gameBtnGhost}>
            {cleared === 4 ? "Keep scoring" : `Open ${current.title}`} <ArrowRight aria-hidden className="size-4" />
          </Link>
        )}
      </section>

      {/* Invites: your profile link signs friends up as invited by you */}
      <section className={`${panel} flex flex-col gap-3 p-4`} aria-labelledby="invite-h">
        <div className="flex flex-col gap-0.5">
          <h2 id="invite-h" className="text-[15px] font-bold">
            Bring your padis
          </h2>
          <p className="text-xs text-fg/60">
            Share your link. Friends who join through it land on your profile.
            {invited > 0 && ` ${invited} ${invited === 1 ? "padi has" : "padis have"} joined from your invites.`}
          </p>
        </div>
        <ShareProfile url={`${site}/p/${slug}`} name={displayName(me.full_name)} />
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/quest/me" className={`${panel} flex items-center gap-3 p-4 transition-transform active:scale-[0.97]`}>
          <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-fg text-on-fg">
            <QrGlyph size={20} />
          </span>
          <span className="text-sm font-bold">My QR</span>
        </Link>
        <Link href="/quest/people" className={`${panel} flex items-center gap-3 p-4 transition-transform active:scale-[0.97]`}>
          <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-surface-3 text-fg">
            <StageGlyph id="padiup" size={22} ink="currentColor" fill="transparent" />
          </span>
          <span className="text-sm font-bold">Find people</span>
        </Link>
      </div>

      <Link
        href="/quest/stage/partners"
        className={`${panel} flex min-h-14 items-center gap-3 px-4 py-3 transition-transform active:scale-[0.98]`}
      >
        <StageBadge id="partners" color="#34A853" size={40} />
        <span className="flex flex-1 flex-col">
          <span className="text-[15px] font-bold">Meet the partners</span>
          <span className="text-xs text-fg/60">
            Check them out +{POINTS.partnerVisit} · follow +{POINTS.partnerFollow} · scan their booth +{POINTS.booth}
          </span>
        </span>
        <ArrowRight aria-hidden className="size-5 text-fg/60" />
      </Link>

      <XPost posted={posted} handle={me.x_handle} points={POINTS.xPost} />

      <JoinGdg claimed={joined} />
      <JoinWhatsApp />

      {/* Mini board */}
      {top.length > 0 && (
        <section className={`${panel} flex flex-col gap-1 p-3`} aria-labelledby="top-h">
          <div className="flex items-center justify-between px-1 pb-1">
            <h2 id="top-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/45">
              TOP PLAYERS
            </h2>
            <Link href="/quest/board" className="text-xs font-bold text-hl">
              See board
            </Link>
          </div>
          <ol>
            {top.map((r) => (
              <li key={r.id} className={`flex items-center gap-3 rounded-2xl px-1 py-2 ${r.id === me.id ? "text-hl" : ""}`}>
                <RankBadge rank={r.rank} size={24} />
                <GameAvatar avatar={r.avatar} initials={r.initials} size={30} />
                <span className="flex-1 truncate text-sm font-bold">{r.name}</span>
                <span className="text-sm font-black tabular-nums">{r.score}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

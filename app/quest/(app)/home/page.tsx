import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CopyLink from "@/components/quest/CopyLink";
import { Avatar, Blob, Eyebrow, pillDark } from "@/components/quest/ui";
import { adminSiteUrl } from "@/lib/admin/site";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS, PRE_EVENT_CAP } from "@/lib/quest/config";
import { checkedInAt, crew, invitesPending, levelUp, missions } from "@/lib/quest/game";
import { leaderboard, myScore } from "@/lib/quest/points";
import { daysUntilEvent, phase } from "@/lib/quest/time";

export const metadata = { title: "Home" };

const segColors = ["bg-g-blue", "bg-g-red", "bg-g-yellow", "bg-g-green"];

export default async function Home() {
  const me = await requireAgent();
  const p = phase();
  const [{ score, total }, board, lu, people, m, invites, checkedIn, site] = await Promise.all([
    myScore(me.id),
    leaderboard(),
    levelUp(me.id),
    crew(me.id),
    missions(me.id),
    invitesPending(me.id),
    p === "event" ? checkedInAt(me.id) : null,
    adminSiteUrl(),
  ]);
  const rank = board.byId.get(me.id)?.rank;
  const days = daysUntilEvent();
  const first = me.full_name.trim().split(/\s+/)[0];
  const inviteUrl = `${site}/quest?ref=${me.invite_code}`;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <header className="flex flex-col gap-1.5">
        <Eyebrow className="text-[#5F5F5F]">Welcome back, agent {first}</Eyebrow>
        <h1 className="type-heading text-[40px] leading-none font-bold lg:text-6xl">
          {p === "pre" ? (
            <>
              <span className="text-g-blue">
                {days} {days === 1 ? "day" : "days"}
              </span>{" "}
              to DevFest.
            </>
          ) : p === "event" ? (
            <>
              It&apos;s <span className="text-g-blue">DevFest</span> day.
            </>
          ) : (
            <>
              Thanks for <span className="text-g-blue">playing.</span>
            </>
          )}
        </h1>
      </header>

      {p === "event" && !checkedIn && (
        <Link
          href="/quest/event"
          className="flex items-center gap-4 rounded-3xl bg-g-blue p-5 text-white transition-colors hover:bg-g-blue/90"
        >
          <span className="flex flex-1 flex-col gap-1">
            <span className="type-heading text-2xl font-bold">Check in to start scoring</span>
            <span className="text-sm text-white/85">
              Scan the screen at the entrance with your phone camera. +{POINTS.checkin} points.
            </span>
          </span>
          <ArrowUpRight aria-hidden className="size-6" />
        </Link>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <section className="relative flex flex-col gap-3 overflow-hidden rounded-[28px] bg-ink p-5 text-white lg:p-7">
          <span aria-hidden className="absolute -top-3.5 -right-[18px] size-[90px] rounded-full bg-[#2A2A2A]" />
          <span aria-hidden className="absolute top-5 right-[26px] h-5 w-[54px] -rotate-20 rounded-full bg-g-red" />
          <h2 className="text-xs font-bold tracking-[0.08em] text-[#BDBDBD]">YOUR RANK</h2>
          <p className="flex items-baseline gap-3">
            <span className="type-heading text-[64px] leading-[0.9] font-bold text-h-yellow">{rank ? `#${rank}` : "–"}</span>
            <span className="text-base font-semibold">{score} points</span>
          </p>
          {p === "pre" && (
            <>
              <div aria-hidden className="flex h-2.5 gap-1">
                {segColors.map((c, i) => (
                  <span
                    key={c}
                    className={`flex-1 rounded-full ${c} ${score >= ((i + 1) * PRE_EVENT_CAP) / 4 ? "" : "opacity-30"}`}
                  />
                ))}
              </div>
              <p className="text-[13px] leading-normal text-[#E0E0E0]">
                {score} of {PRE_EVENT_CAP} pre-event points.{" "}
                {total > score ? `${total - score} more are banked for 17 Oct. ` : ""}The rest is won at the venue on 17 Oct.
              </p>
            </>
          )}
          {p !== "pre" && (
            <p className="text-[13px] leading-normal text-[#E0E0E0]">
              Every point counts now. Meet people, scan rooms and booths, and answer recap quizzes.
            </p>
          )}
          <Link
            href="/quest/board"
            className="mt-auto flex min-h-10 items-center self-start rounded-full bg-white px-4 text-sm font-bold text-ink hover:bg-white/85"
          >
            See the board
          </Link>
        </section>

        <Blob className="flex flex-col gap-2.5 bg-p-green p-5 lg:p-7">
          <span aria-hidden className="absolute top-[18px] right-[22px] size-10 rotate-[18deg] rounded-xl bg-g-green" />
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
              {lu.today.total ? "Today's drop" : "Level Up"}
            </span>
            {lu.streak > 1 && (
              <span className="rounded-full bg-h-yellow px-3 py-1 text-xs font-bold">{lu.streak}-day streak</span>
            )}
          </div>
          <h2 className="type-heading text-[26px] leading-[1.05] font-bold">
            Level Up:
            <br />
            {lu.today.track ?? lu.card?.track ?? "All caught up"}
          </h2>
          <p className="text-sm leading-normal text-[#1E3A24]">
            {lu.today.total
              ? lu.today.left
                ? `${lu.today.left} of ${lu.today.total} cards left today, about ${Math.max(1, Math.round(lu.today.left * 0.6))} minutes.`
                : `Today's set is done. You learnt ${lu.learntToday} things today.`
              : lu.card
                ? "Learn a card, answer a question, earn points."
                : "You've answered every open card. New ones drop each morning."}
          </p>
          {lu.card && (
            <Link href="/quest/level-up" className={`${pillDark} mt-auto self-start`}>
              Play now
            </Link>
          )}
        </Blob>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Link
          href="/quest/crew"
          className="flex items-center gap-3.5 rounded-3xl bg-p-red px-[18px] py-4 transition-transform hover:-translate-y-0.5 lg:flex-col lg:items-start lg:p-6"
        >
          {people.pending.length > 0 && (
            <span aria-hidden className="flex">
              {people.pending.slice(0, 2).map((r, i) => (
                <Avatar
                  key={r.id}
                  id={r.id}
                  initials={r.initials}
                  size={38}
                  className={`border-[3px] border-p-red ${i ? "-ml-3" : ""}`}
                />
              ))}
            </span>
          )}
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-base font-bold">
              {people.pending.length
                ? `${people.pending.length} ${people.pending.length === 1 ? "agent wants" : "agents want"} to connect`
                : `Your crew · ${people.connected.length}`}
            </span>
            <span className="text-[13px] text-[#5C2B2B]">
              {people.pending.length ? "Accept or decline in one tap" : "Requests and connections"}
            </span>
          </span>
          <ArrowUpRight aria-hidden className="size-[22px] lg:hidden" />
        </Link>

        <Link
          href="/quest/missions"
          className="flex items-center gap-3.5 rounded-3xl bg-white px-[18px] py-4 transition-transform hover:-translate-y-0.5 lg:flex-col lg:items-start lg:p-6"
        >
          <span aria-hidden className="grid grid-cols-2 gap-[3px]">
            <span className="size-2.5 rounded-full bg-g-blue" />
            <span className="size-2.5 rounded-full bg-g-red" />
            <span className="size-2.5 rounded-full bg-g-yellow" />
            <span className="size-2.5 rounded-full bg-g-green" />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-base font-bold">
              {m.left ? `${m.left} ${m.left === 1 ? "mission" : "missions"} left` : "Missions done"}
            </span>
            <span className="text-[13px] text-[#5F5F5F]">
              {m.left ? "Follow, join and post for bonus points" : `+${m.earned} bonus points earned`}
            </span>
          </span>
          <ArrowUpRight aria-hidden className="size-[22px] lg:hidden" />
        </Link>

        <section className="flex flex-col gap-2.5 rounded-3xl bg-p-yellow p-[18px] lg:p-6">
          <h2 className="type-heading text-[22px] font-bold">Bring your padi</h2>
          <p className="text-sm leading-normal text-[#4A3A10]">
            +{POINTS.invite} points for each friend who joins with your link and checks in on 17 Oct.
            {invites > 0 ? ` ${invites} ${invites === 1 ? "friend" : "friends"} pending.` : ""}
          </p>
          <CopyLink
            url={inviteUrl}
            className="mt-auto min-h-[46px] rounded-full border-2 border-ink text-[15px] font-bold transition-colors hover:bg-ink/5"
          />
        </section>
      </div>
    </div>
  );
}

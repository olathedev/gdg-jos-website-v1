import Link from "next/link";
import QRCode from "qrcode";
import { StackTag } from "@/components/quest/ui";
import { adminSiteUrl } from "@/lib/admin/site";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS } from "@/lib/quest/config";
import { checkedInAt, eventSummary } from "@/lib/quest/game";
import { phase, timeLabel } from "@/lib/quest/time";
import { displayName } from "@/lib/quest/validate";

export const metadata = { title: "Event day" };

const notices: Record<string, { ok: boolean; text: string }> = {
  checkedin: { ok: true, text: `You're checked in. +${POINTS.checkin}` },
  room: { ok: true, text: `Room scanned. +${POINTS.room}` },
  booth: { ok: true, text: `Booth scanned. +${POINTS.booth}` },
  again: { ok: true, text: "Already scanned. Each code pays once." },
  expired: { ok: false, text: "That entrance code expired. Scan the screen again; it changes every 30 seconds." },
  early: { ok: false, text: "Check-in and scans open at the venue on 17 Oct." },
  notin: { ok: false, text: "Check in at the entrance screen first, then scan again." },
  closed: { ok: false, text: "That code only works while its session or booth is open." },
  unknown: { ok: false, text: "That code isn't a DevFest station." },
};

async function agentQr(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#1e1e1e", light: "#ffffff" } });
}

export default async function EventDay({ searchParams }: PageProps<"/quest/event">) {
  const me = await requireAgent();
  const sp = await searchParams;
  const p = phase();
  const [at, summary, site] = await Promise.all([checkedInAt(me.id), eventSummary(me.id), adminSiteUrl()]);
  const qr = await agentQr(`${site}/quest/meet/${me.quest_token}`);
  const notice = typeof sp.r === "string" ? (notices[sp.r] ?? null) : null;
  const name = displayName(me.full_name, me.is_adult);

  const qrCard = (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-[28px_72px_28px_28px] bg-white p-6 text-center lg:col-start-2 lg:row-span-3 lg:row-start-1">
      <span aria-hidden className="absolute top-4 left-4 size-5 rounded-full bg-g-blue" />
      <span aria-hidden className="absolute top-8 right-6 h-4 w-10 rotate-20 rounded-full bg-g-red" />
      <span aria-hidden className="absolute bottom-6 left-6 size-6 rotate-12 rounded-md bg-g-green" />
      <span aria-hidden className="absolute right-5 bottom-10 size-4 rounded-full bg-g-yellow" />
      <span className="text-xs font-bold tracking-[0.1em] text-[#1967D2]">MY AGENT QR</span>
      <div
        role="img"
        aria-label={`Agent QR code for ${name}`}
        className="w-[min(240px,70vw)] [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qr }}
      />
      <span className="type-heading text-2xl font-bold">{name}</span>
      {me.stack.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {me.stack.map((s) => (
            <StackTag key={s} label={s} />
          ))}
        </div>
      )}
      <span className="max-w-xs text-sm leading-normal text-[#5F5F5F]">
        {p === "event"
          ? `Let another agent scan this with their phone camera. You both score ${POINTS.meet}.`
          : "Works at the venue on 17 Oct. Another agent scans it with their phone camera and you both score."}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {notice && (
        <p role="status" className={`rounded-2xl px-4 py-3 text-sm font-semibold ${notice.ok ? "bg-p-green" : "bg-p-red"}`}>
          {notice.text}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-x-8">
          {p === "event" && at ? (
            <div className="relative flex flex-col gap-1 overflow-hidden rounded-[28px] bg-ink p-5 text-white">
              <span aria-hidden className="absolute -top-8 -right-8 size-24 rounded-full bg-g-green" />
              <span aria-hidden className="absolute right-6 bottom-5 h-4 w-10 -rotate-12 rounded-full bg-g-yellow" />
              <span className="relative text-xs font-bold tracking-[0.08em] text-[#BDBDBD]">CHECKED IN {timeLabel(at)}</span>
              <span className="type-heading relative text-[34px] leading-tight font-bold">
                You&apos;re in, <span className="text-h-blue">agent.</span>
              </span>
              <span className="relative text-sm text-[#E0E0E0]">+{POINTS.checkin} points for showing up</span>
            </div>
          ) : p === "event" ? (
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-[28px] bg-g-blue p-6 text-white">
              <span className="text-xs font-bold tracking-[0.08em] text-white/80">STEP 1</span>
              <span className="type-heading text-[32px] leading-tight font-bold">Check in at the entrance</span>
              <p className="text-[15px] leading-normal text-white/90">
                Point your phone camera at the big screen by the door and open the link. It changes every 30 seconds, so scan it
                there and then. +{POINTS.checkin} points.
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-[28px] bg-ink p-6 text-white">
              <span aria-hidden className="absolute -top-4 -right-4 size-24 rounded-full bg-[#2A2A2A]" />
              <span className="relative text-xs font-bold tracking-[0.08em] text-[#BDBDBD]">
                {p === "pre" ? "OPENS SAT 17 OCT" : "DEVFEST JOS 2026 IS DONE"}
              </span>
              <span className="type-heading relative text-[32px] leading-tight font-bold">
                {p === "pre" ? (
                  <>
                    Event day <span className="text-h-blue">unlocks</span> at the venue.
                  </>
                ) : (
                  "Thanks for playing."
                )}
              </span>
              {p === "pre" && (
                <ul className="relative mt-2 flex flex-col gap-1.5 text-sm text-[#E0E0E0]">
                  <li>Check in at the entrance screen: +{POINTS.checkin}</li>
                  <li>Meet an agent and scan their QR: +{POINTS.meet} each</li>
                  <li>Scan room doors and booths: +{POINTS.room} each</li>
                  <li>Recap quizzes after each talk: +{POINTS.recap} per answer</li>
                </ul>
              )}
            </div>
          )}

          {qrCard}

          {(p !== "event" || at) && (
            <section className="flex flex-col gap-1 rounded-3xl bg-white p-[18px]">
              <h2 className="pb-1 text-xs font-bold tracking-[0.08em] text-ink/70">TODAY SO FAR</h2>
              {summary.stations.length + summary.meets.length + summary.recaps.length === 0 && (
                <p className="py-2 text-sm text-[#5F5F5F]">
                  {p === "event" ? "Nothing yet. Find an agent and scan their QR." : "Scans you make on 17 Oct show up here."}
                </p>
              )}
              {summary.meets.map((m) => (
                <div key={`${m.name}-${String(m.at)}`} className="flex items-center gap-3 border-t border-[#EDEDED] py-2.5 first-of-type:border-0">
                  <span aria-hidden className="size-2.5 rounded-full bg-g-red" />
                  <span className="flex-1 text-sm">Met {m.name}</span>
                  <span className="text-sm font-bold">+{POINTS.meet}</span>
                </div>
              ))}
              {summary.stations.map((s) => (
                <div key={`${s.name}-${String(s.at)}`} className="flex items-center gap-3 border-t border-[#EDEDED] py-2.5">
                  <span aria-hidden className={`size-2.5 rounded-full ${s.kind === "room" ? "bg-g-blue" : "bg-g-yellow"}`} />
                  <span className="flex-1 text-sm">
                    {s.kind === "room" ? "Room" : "Booth"}: {s.name}
                  </span>
                  <span className="text-sm font-bold">+{s.points}</span>
                </div>
              ))}
              {summary.recaps.map((r) => (
                <div key={r.name} className="flex items-center gap-3 border-t border-[#EDEDED] py-2.5">
                  <span aria-hidden className="size-2.5 rounded-full bg-g-green" />
                  <span className="flex-1 text-sm">Recap quiz: {r.name}</span>
                  {r.open ? (
                    <Link href="/quest/level-up" className="text-sm font-bold text-[#1967D2] underline">
                      Play
                    </Link>
                  ) : (
                    <span className="text-sm text-[#5F5F5F]">{r.closes_at ? `Opens ${timeLabel(r.closes_at)}` : "Soon"}</span>
                  )}
                </div>
              ))}
              {summary.missions.length > 0 && (
                <p className="mt-1 rounded-2xl bg-p-yellow px-3.5 py-2.5 text-[13px] font-semibold">
                  Missions done: {summary.missions.map((m) => (m === "rooms3" ? "three talks" : "five new stacks")).join(", ")} · +
                  {POINTS.mission} each
                </p>
              )}
            </section>
          )}

          {p === "event" && (
            <Link
              href="/quest/people"
              className="flex min-h-14 items-center justify-center rounded-full bg-ink text-base font-bold text-white hover:bg-ink/85"
            >
              See who&apos;s here now
            </Link>
          )}
      </div>

      {p === "event" && (
        <p className="text-[12.5px] leading-normal text-[#5F5F5F]">
          Missions for +{POINTS.mission} each: scan three different talk rooms, and meet five agents who share none of your stack
          tags.
        </p>
      )}
    </div>
  );
}

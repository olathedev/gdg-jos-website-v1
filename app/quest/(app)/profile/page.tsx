import JoinGdg from "@/components/quest/JoinGdg";
import RoleBadge, { roleRing } from "@/components/quest/RoleBadge";
import ShareProfile from "@/components/quest/ShareProfile";
import ThemeSwitch from "@/components/quest/ThemeSwitch";
import { adminSiteUrl } from "@/lib/admin/site";
import { ensureSlug } from "@/lib/quest/profiles";
import { LogOut, Pencil } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/quest/actions";
import { BrandMark, QrGlyph, Spark, StageBadge } from "@/components/quest/icons";
import { GameAvatar, gameBtn, gameBtnGhost, panel, stackStyle } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { getCircle, roleOf } from "@/lib/quest/circles";
import { roleLabel } from "@/lib/quest/roles";
import { STAGES } from "@/lib/quest/config";
import { leaderboard, myScore } from "@/lib/quest/points";
import { gameState } from "@/lib/quest/stages";
import { displayName, initials, links } from "@/lib/quest/validate";
import { db } from "@/lib/tickets/db";

export const metadata = { title: "Profile" };

export default async function Profile({ searchParams }: PageProps<"/quest/profile">) {
  const me = await requireAgent();
  const granted = (await searchParams).role;
  const [slug, site, circle] = await Promise.all([ensureSlug(me), adminSiteUrl(), getCircle()]);
  const role = circle ? await roleOf(circle.id, me) : "attendee";
  const [{ score }, board, g, [{ joined, invited }]] = await Promise.all([
    myScore(me.id),
    leaderboard(),
    gameState(me.id),
    db()<{ joined: boolean; invited: number }[]>`
      select exists (select 1 from quest_points where user_id = ${me.id} and source_type = 'community') as joined,
             (select count(*)::int from quest_profiles where invited_by = ${me.id} and onboarded_at is not null) as invited`,
  ]);
  const rank = board.byId.get(me.id)?.rank;
  const socials = [
    me.github && { id: "github", label: "GitHub", href: links.github(me.github) },
    me.linkedin && { id: "linkedin", label: "LinkedIn", href: links.linkedin(me.linkedin) },
    me.x_handle && { id: "x", label: "X", href: links.x_handle(me.x_handle) },
    me.instagram && { id: "instagram", label: "Instagram", href: links.instagram(me.instagram) },
    me.whatsapp && { id: "whatsapp", label: "WhatsApp", href: links.whatsapp(me.whatsapp) },
  ].filter((x): x is { id: string; label: string; href: string } => Boolean(x));
  const cleared = STAGES.filter((s) => g.states[s.id] === "done").length;
  const stats = [
    { label: "Score", value: score },
    { label: "Rank", value: rank ? `#${rank}` : "–" },
    { label: "Padis", value: g.counts.padis },
  ];

  return (
    <div className="flex flex-col gap-5 pt-2">
      {circle && typeof granted === "string" && (
        <p role="status" className="quest-pop rounded-full border border-g-green/40 bg-g-green/10 px-4 py-2.5 text-center text-sm font-bold text-good">
          {granted === "kept" || role === "attendee"
            ? `You're in ${circle.name}.`
            : `You're now a${role === "organiser" ? "n" : ""} ${roleLabel(role)} at ${circle.name}`}
        </p>
      )}
      {/* Player card */}
      <section className={`${panel} flex flex-col items-center gap-3 px-5 pt-7 pb-6 text-center`} aria-label="Your player card">
        <GameAvatar avatar={me.avatar} initials={initials(me.full_name)} size={96} ring={roleRing(role === "attendee" ? null : role)} />
        <h1 className="type-heading text-[26px] leading-tight font-bold">{displayName(me.full_name, me.is_adult)}</h1>
        {role !== "attendee" && circle && <RoleBadge role={role} circle={circle.name} large />}
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Your stack">
          {me.stack.map((s) => {
            const st = stackStyle(s);
            return (
              <li
                key={s}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold"
                style={{ borderColor: `${st.color}66`, color: st.tint }}
              >
                <span aria-hidden className="size-1.5 rounded-full" style={{ background: st.color }} />
                {s}
              </li>
            );
          })}
        </ul>
        {me.fun_fact && (
          <p className="max-w-xs text-[15px] leading-snug text-fg/80">
            <span className="text-g-blue">{"{ "}</span>
            {me.fun_fact}
            <span className="text-g-yellow">{" }"}</span>
          </p>
        )}
        {socials.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Your socials">
            {socials.map((c) => (
              <li key={c.id}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-9 items-center gap-1.5 rounded-full border border-fg/[0.12] px-3 text-xs font-bold text-fg/80 hover:bg-fg/[0.05]"
                >
                  <BrandMark id={c.id} size={14} />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-fg/45">
          {me.hidden ? "You're hidden from People." : "You're in People."}{" "}
          {me.whatsapp && me.share_whatsapp ? "Padis see your WhatsApp." : ""}
        </p>
        <Link href="/quest/setup" className="mt-1 flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-hl hover:bg-fg/[0.05]">
          <Pencil aria-hidden className="size-3.5" /> Edit player card
        </Link>
      </section>

      {/* Stats */}
      <dl className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className={`${panel} flex flex-col items-center gap-0.5 py-3.5`}>
            <dt className="text-[11px] font-bold tracking-[0.15em] text-fg/45 uppercase">{s.label}</dt>
            <dd className="type-heading flex items-center gap-1 text-2xl font-bold tabular-nums">
              {s.label === "Score" && <Spark size={14} />}
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Stage progress */}
      <section className={`${panel} flex flex-col gap-3 p-4`} aria-labelledby="stages-h">
        <div className="flex items-center justify-between">
          <h2 id="stages-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/45">
            STAGES
          </h2>
          <span className="text-xs font-bold text-fg/60">{cleared}/4 cleared</span>
        </div>
        <ul className="grid grid-cols-4 gap-2">
          {STAGES.map((st) => {
            const s = g.states[st.id];
            return (
              <li key={st.id}>
                <Link href={`/quest/stage/${st.id}`} className="flex flex-col items-center gap-1.5 text-center">
                  <span className={`flex h-11 items-center ${s === "open" || s === "live" ? "opacity-80" : ""}`}>
                    <StageBadge id={st.id} color={st.color} size={st.id === "partners" ? 36 : 44} locked={s === "locked"} />
                  </span>
                  <span className={`text-[11px] leading-tight font-bold ${s === "locked" ? "text-fg/30" : "text-fg/75"}`}>{st.short}</span>
                  <span className={`text-[10px] font-bold ${s === "done" ? "text-live" : "text-fg/35"}`}>
                    {s === "done" ? "Cleared" : s === "locked" ? "Locked" : s === "live" ? "Live" : "Open"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {circle && (role === "organiser" || role === "co_organiser") && (
        <Link href={`/c/${circle.slug}/admin`} className={gameBtnGhost}>
          Circle admin · {circle.name}
        </Link>
      )}

      <section className={`${panel} flex flex-col items-center gap-2 p-4`} aria-labelledby="link-h">
        <h2 id="link-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/45">
          YOUR PROFILE LINK
        </h2>
        <p className="text-center text-xs text-fg/60">
          Share it to invite padis.{invited > 0 && ` ${invited} ${invited === 1 ? "has" : "have"} joined from your invites.`}
        </p>
        <ShareProfile url={`${site}/p/${slug}`} name={displayName(me.full_name)} />
      </section>

      <JoinGdg claimed={joined} />

      <ThemeSwitch />

      <div className="flex flex-col gap-3">
        <Link href="/quest/me" className={gameBtn}>
          <QrGlyph size={20} /> My QR
        </Link>
        <form action={signOutAction} className="flex justify-center">
          <button type="submit" className={gameBtnGhost}>
            <LogOut aria-hidden className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

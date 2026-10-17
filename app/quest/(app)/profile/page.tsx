import JoinGdg from "@/components/quest/JoinGdg";
import { LogOut, Pencil } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/quest/actions";
import { BrandMark, QrGlyph, Spark, StageBadge } from "@/components/quest/icons";
import { GameAvatar, gameBtn, gameBtnGhost, panel, stackStyle } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { STAGES } from "@/lib/quest/config";
import { leaderboard, myScore } from "@/lib/quest/points";
import { gameState } from "@/lib/quest/stages";
import { displayName, initials, links } from "@/lib/quest/validate";

export const metadata = { title: "Profile" };

export default async function Profile() {
  const me = await requireAgent();
  const [{ score }, board, g] = await Promise.all([myScore(me.id), leaderboard(), gameState(me.id)]);
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
      {/* Player card */}
      <section className={`${panel} flex flex-col items-center gap-3 px-5 pt-7 pb-6 text-center`} aria-label="Your player card">
        <GameAvatar avatar={me.avatar} initials={initials(me.full_name)} size={96} />
        <h1 className="type-heading text-[26px] leading-tight font-bold">{displayName(me.full_name, me.is_adult)}</h1>
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
          <p className="max-w-xs text-[15px] leading-snug text-white/80">
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
                  className="flex min-h-9 items-center gap-1.5 rounded-full border border-white/[0.12] px-3 text-xs font-bold text-white/80 hover:bg-white/[0.05]"
                >
                  <BrandMark id={c.id} size={14} />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-white/45">
          You&apos;re in People.{" "}
          {me.whatsapp && me.share_whatsapp ? "Padis see your WhatsApp." : ""}
        </p>
        <Link href="/quest/setup" className="mt-1 flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-h-yellow hover:bg-white/[0.05]">
          <Pencil aria-hidden className="size-3.5" /> Edit player card
        </Link>
      </section>

      {/* Stats */}
      <dl className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className={`${panel} flex flex-col items-center gap-0.5 py-3.5`}>
            <dt className="text-[11px] font-bold tracking-[0.15em] text-white/45 uppercase">{s.label}</dt>
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
          <h2 id="stages-h" className="text-[11px] font-bold tracking-[0.2em] text-white/45">
            STAGES
          </h2>
          <span className="text-xs font-bold text-white/60">{cleared}/4 cleared</span>
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
                  <span className={`text-[11px] leading-tight font-bold ${s === "locked" ? "text-white/30" : "text-white/75"}`}>{st.short}</span>
                  <span className={`text-[10px] font-bold ${s === "done" ? "text-[#81C995]" : "text-white/35"}`}>
                    {s === "done" ? "Cleared" : s === "locked" ? "Locked" : s === "live" ? "Live" : "Open"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <JoinGdg />

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

import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartnerFollows, PartnerLogo, VisitTimer } from "@/components/quest/PartnerProfile";
import { Banner } from "@/components/quest/Stage";
import { gameBtnGhost, panel } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS } from "@/lib/quest/config";
import { getCircle, roleOf } from "@/lib/quest/circles";
import { isPartnerManager } from "@/lib/quest/partner-admin";
import { partnerProfile } from "@/lib/quest/partners";
import { isStaff } from "@/lib/quest/roles";

export const metadata = { title: "Partner" };

export default async function PartnerPage({ params, searchParams }: PageProps<"/quest/stage/partners/[slug]">) {
  const me = await requireAgent();
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();
  const p = await partnerProfile(me.id, slug);
  if (!p) notFound();
  const circle = await getCircle();
  const canEdit = (circle && isStaff(await roleOf(circle.id, me))) || (await isPartnerManager(me.id, p.id));
  const r = (await searchParams).r;

  return (
    <div className="flex flex-col gap-5 pt-2">
      {r === "booth" && (
        <Banner tone="good">
          +{POINTS.booth} points for visiting {p.name}&apos;s booth
        </Banner>
      )}
      {r === "again" && <Banner tone="info">You&apos;ve already scanned this booth.</Banner>}
      <VisitTimer stationId={p.id} name={p.name} done={p.visited} />

      <div className="flex items-center justify-between gap-3">
        <Link href="/quest/stage/partners" className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-fg/60 hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> All partners
        </Link>
        {canEdit && (
          <Link href={`/quest/stage/partners/${p.slug}/edit`} className="flex min-h-11 items-center rounded-full border border-fg/20 px-4 text-sm font-bold hover:bg-fg/[0.06]">
            Edit our profile
          </Link>
        )}
      </div>

      <section className={`${panel} flex flex-col items-center gap-3 px-5 pt-7 pb-6 text-center`} aria-labelledby="partner-h">
        <PartnerLogo name={p.name} url={p.logo_url} size={88} />
        <h1 id="partner-h" className="type-heading text-[26px] leading-tight font-bold">
          {p.name}
        </h1>
        {p.description && <p className="max-w-sm text-[15px] leading-snug whitespace-pre-line text-fg/80">{p.description}</p>}
        {p.website_url && (
          <a href={p.website_url} target="_blank" rel="noopener noreferrer" className={`${gameBtnGhost} mt-1`}>
            Visit website <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </section>

      <section className={`${panel} flex flex-col gap-3 p-4`} aria-labelledby="earn-h">
        <h2 id="earn-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/45">
          EARN POINTS
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span>Check out their profile</span>
            <Earned done={p.visited} points={POINTS.partnerVisit} />
          </li>
          <li className="flex items-center justify-between gap-3">
            <span>Visit their booth and scan their QR</span>
            <Earned done={p.booth} points={POINTS.booth} />
          </li>
        </ul>
        {!p.booth && <p className="text-xs text-fg/55">Visit their booth and scan their QR for {POINTS.booth} points.</p>}
      </section>

      {p.socials.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="follow-h">
          <h2 id="follow-h" className="text-center text-[11px] font-bold tracking-[0.2em] text-fg/50">
            FOLLOW {p.name.toUpperCase()}
          </h2>
          <PartnerFollows stationId={p.id} name={p.name} socials={p.socials} followed={p.follows} />
        </section>
      )}
    </div>
  );
}

function Earned({ done, points }: { done: boolean; points: number }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black ${done ? "bg-g-green text-white" : "bg-h-yellow text-[#0A0A0A]"}`}>
      {done ? (
        <span className="flex items-center gap-1">
          <Check aria-hidden className="size-3" strokeWidth={4} /> Done
        </span>
      ) : (
        `+${points}`
      )}
    </span>
  );
}

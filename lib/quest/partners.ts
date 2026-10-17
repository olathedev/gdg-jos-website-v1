import "server-only";
import { db } from "@/lib/tickets/db";
import { PARTNER_VISIT_SECONDS, POINTS } from "./config";
import { GameError } from "./game";
import { award, invalidateBoard } from "./points";
import { PARTNER_SOCIALS, type PartnerSocial } from "./validate";

// Partner profiles for players. Partners are quest_stations of kind 'booth'.
// Booth scans (/quest/s/<code>) stay in scanStation; the booth code is never selected here.

type Row = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  booth: boolean;
  visited: boolean;
  follows: string[];
} & Record<PartnerSocial, string | null>;

export type PartnerCard = Omit<Row, PartnerSocial> & { socials: { id: PartnerSocial; name: string; href: string }[] };

const toCard = ({ x, instagram, linkedin, facebook, github, youtube, ...r }: Row): PartnerCard => {
  const handles: Record<PartnerSocial, string | null> = { x, instagram, linkedin, facebook, github, youtube };
  return { ...r, socials: PARTNER_SOCIALS.flatMap((s) => (handles[s.id] ? [{ id: s.id, name: s.name, href: s.href(handles[s.id]!) }] : [])) };
};

/** Active partners with this player's progress: booth scanned, profile visited, platforms followed. */
export async function partnerCards(userId: string) {
  const rows = await db()<Row[]>`
    select s.id, s.slug, s.name, s.logo_url, s.description, s.website_url,
           s.x, s.instagram, s.linkedin, s.facebook, s.github, s.youtube,
           exists (select 1 from quest_station_scans x where x.station_id = s.id and x.user_id = ${userId}) as booth,
           exists (select 1 from quest_points q where q.user_id = ${userId} and q.source_type = 'partner_visit' and q.source_id = s.id::text) as visited,
           coalesce((select array_agg(split_part(q.source_id, ':', 2)) from quest_points q
                     where q.user_id = ${userId} and q.source_type = 'partner_follow' and q.source_id like s.id::text || ':%'), '{}') as follows
    from quest_stations s
    where s.kind = 'booth' and s.active and s.slug is not null
    order by s.sort_order, s.name`;
  return rows.map(toCard);
}

/** One partner's profile. Opening it starts the clock for the online visit points. */
export async function partnerProfile(userId: string, slug: string) {
  const card = (await partnerCards(userId)).find((p) => p.slug === slug);
  if (!card) return null;
  await db()`insert into quest_partner_views (user_id, station_id) values (${userId}, ${card.id}) on conflict do nothing`;
  return card;
}

/** Online visit: once per partner, only after PARTNER_VISIT_SECONDS on the profile. Returns the points, or 0. */
export async function claimPartnerVisit(userId: string, stationId: string) {
  const sql = db();
  const [v] = await sql<{ ready: boolean }[]>`
    select v.first_viewed_at <= now() - make_interval(secs => ${PARTNER_VISIT_SECONDS}) as ready
    from quest_partner_views v join quest_stations s on s.id = v.station_id
    where v.user_id = ${userId} and v.station_id = ${stationId} and s.kind = 'booth' and s.active`;
  if (!v?.ready) return 0;
  if (!(await award(sql, userId, "partner_visit", stationId, POINTS.partnerVisit))) return 0;
  invalidateBoard();
  return POINTS.partnerVisit;
}

/** Follows can't be checked by anyone, so they're self-claimed like the GDG Jos follows. */
export async function claimPartnerFollow(userId: string, stationId: string, platform: string) {
  const social = PARTNER_SOCIALS.find((s) => s.id === platform);
  if (!social) throw new GameError("Unknown platform.");
  const sql = db();
  const [s] = await sql<{ handle: string | null }[]>`
    select ${sql(social.id)} as handle from quest_stations where id = ${stationId} and kind = 'booth' and active`;
  if (!s?.handle) throw new GameError("This partner isn't on that platform.");
  if (await award(sql, userId, "partner_follow", `${stationId}:${social.id}`, POINTS.partnerFollow)) invalidateBoard();
}

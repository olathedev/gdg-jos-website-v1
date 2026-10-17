import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/tickets/db";
import { GameError } from "./game";
import type { PartnerFull, PartnerPublic } from "./partner-input";
import { displayName, type PartnerSocial } from "./validate";

// Partner editing for circle staff and partner managers. The booth code is never selected here:
// booth QRs are drawn on the server (/c/<slug>/partners/<id>/qr).

export type EditablePartner = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  sort_order: number;
  active: boolean;
  scans: number;
  updatedBy: string | null;
  updatedAt: string | null;
  managers: { id: string; name: string }[];
} & Record<PartnerSocial, string | null>;

type Row = Omit<EditablePartner, "updatedBy" | "updatedAt" | "managers"> & {
  updated_at: Date | null;
  editor: string | null;
  managers: { id: string; name: string }[] | null;
};

const SELECT = (where: string) => `
  select s.id, s.slug, s.name, s.description, s.website_url, s.logo_url, s.sort_order, s.active,
         s.x, s.instagram, s.linkedin, s.facebook, s.github, s.youtube, s.updated_at, e.full_name as editor,
         (select count(*)::int from quest_station_scans x where x.station_id = s.id) as scans,
         (select json_agg(json_build_object('id', p.id, 'name', p.full_name) order by m.added_at)
            from quest_partner_managers m join quest_profiles p on p.id = m.user_id where m.station_id = s.id) as managers
  from quest_stations s left join quest_profiles e on e.id = s.updated_by
  where s.kind = 'booth' ${where}
  order by s.sort_order, s.name`;

const toEditable = ({ updated_at, editor, managers, ...r }: Row): EditablePartner => ({
  ...r,
  updatedBy: editor ? displayName(editor) : null,
  updatedAt: updated_at ? updated_at.toISOString() : null,
  managers: (managers ?? []).map((m) => ({ id: m.id, name: displayName(m.name) })),
});

export async function editablePartners() {
  return (await db().unsafe<Row[]>(SELECT(""))).map(toEditable);
}

export async function editablePartner(id: string) {
  const [r] = await db().unsafe<Row[]>(SELECT("and s.id = $1"), [id]);
  return r ? toEditable(r) : null;
}

export async function isPartnerManager(userId: string, stationId: string) {
  const [r] = await db()`select 1 from quest_partner_managers where user_id = ${userId} and station_id = ${stationId}`;
  return Boolean(r);
}

/** Organisers and co-organisers: every field. */
export async function updatePartnerFull(id: string, d: PartnerFull, by: string) {
  const rows = await db()`
    update quest_stations set
      name = ${d.name}, description = ${d.description}, website_url = ${d.website_url}, logo_url = ${d.logo_url},
      x = ${d.x}, instagram = ${d.instagram}, linkedin = ${d.linkedin}, facebook = ${d.facebook},
      github = ${d.github}, youtube = ${d.youtube}, sort_order = ${d.sort_order}, active = ${d.active},
      updated_by = ${by}, updated_at = now()
    where id = ${id} and kind = 'booth' returning id`;
  if (!rows.length) throw new GameError("That partner doesn't exist.");
}

/** A partner's managers: logo, description, website and socials only. */
export async function updatePartnerPublic(id: string, d: PartnerPublic, by: string) {
  await db()`
    update quest_stations set
      description = ${d.description}, website_url = ${d.website_url}, logo_url = ${d.logo_url},
      x = ${d.x}, instagram = ${d.instagram}, linkedin = ${d.linkedin}, facebook = ${d.facebook},
      github = ${d.github}, youtube = ${d.youtube}, updated_by = ${by}, updated_at = now()
    where id = ${id} and kind = 'booth'`;
}

export async function addPartnerByName(name: string, by: string) {
  const sql = db();
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "partner";
  const code = () => `p-${randomBytes(12).toString("base64url")}`;
  try {
    await sql`insert into quest_stations (kind, name, code, slug, updated_by, updated_at) values ('booth', ${name}, ${code()}, ${base}, ${by}, now())`;
  } catch (e) {
    if ((e as { code?: string })?.code !== "23505") throw e;
    await sql`insert into quest_stations (kind, name, code, slug, updated_by, updated_at)
      values ('booth', ${name}, ${code()}, ${`${base}-${randomBytes(2).toString("hex")}`}, ${by}, now())`;
  }
}

/** New booth code: QRs printed before stop working. Points already earned stay. */
export async function resetBoothCode(id: string, by: string) {
  await db()`update quest_stations set code = ${`p-${randomBytes(12).toString("base64url")}`}, updated_by = ${by}, updated_at = now() where id = ${id} and kind = 'booth'`;
}

/** Link a PadiUp account (found by its sign-in email) to a partner as a manager. */
export async function addManager(stationId: string, email: string, by: string) {
  const sql = db();
  const [p] = await sql<{ id: string; full_name: string }[]>`
    select id, full_name from quest_profiles where lower(email) = lower(${email.trim()}) and onboarded_at is not null`;
  if (!p) throw new GameError("No PadiUp player with that email. They need to sign in and set up their card first.");
  const [s] = await sql`select 1 from quest_stations where id = ${stationId} and kind = 'booth'`;
  if (!s) throw new GameError("That partner doesn't exist.");
  await sql`insert into quest_partner_managers (station_id, user_id, added_by) values (${stationId}, ${p.id}, ${by}) on conflict do nothing`;
  return displayName(p.full_name);
}

export async function removeManager(stationId: string, userId: string) {
  await db()`delete from quest_partner_managers where station_id = ${stationId} and user_id = ${userId}`;
}

/** The booth link for a QR, only for the server-drawn image. */
export async function boothCode(id: string) {
  const [r] = await db()<{ code: string; name: string }[]>`select code, name from quest_stations where id = ${id} and kind = 'booth'`;
  return r ?? null;
}

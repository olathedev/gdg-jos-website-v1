// Roles in a circle and who may do what. Pure: used by server checks and to shape the UI.
// The server always re-checks; nothing here is trusted from the browser.

/** What groups are called. Rename here only. */
export const GROUP_LABEL = { one: "circle", many: "circles" } as const;

/** The circle this deployment runs (DevFest Jos 2026). */
export const CURRENT_CIRCLE = "devfest-jos-2026";

export const ROLES = ["attendee", "speaker", "co_organiser", "organiser"] as const;
export type Role = (typeof ROLES)[number];
export type StaffRole = Exclude<Role, "attendee">;

const rank: Record<Role, number> = { attendee: 0, speaker: 1, co_organiser: 2, organiser: 3 };
export const higher = (a: Role, b: Role) => rank[a] > rank[b];

export const ROLE_INFO: Record<StaffRole, { word: string; label: string; plural: string; color: string }> = {
  organiser: { word: "ORGANISER", label: "Organiser", plural: "Organisers", color: "#1A73E8" },
  co_organiser: { word: "CO-ORGANISER", label: "Co-organiser", plural: "Co-organisers", color: "#188038" },
  speaker: { word: "SPEAKER", label: "Speaker", plural: "Speakers", color: "#B3135A" },
};
export const roleLabel = (r: Role) => (r === "attendee" ? "Attendee" : ROLE_INFO[r].label);

/** Opens circle admin, edits partners and settings, sees circle numbers and the member list. */
export const isStaff = (r: Role): r is "organiser" | "co_organiser" => r === "organiser" || r === "co_organiser";

/** Organisers and co-organisers earn points but can't win prizes. */
export const prizeEligible = (r: Role) => !isStaff(r);

/** Roles the actor may give to someone who currently has `target`. Never yourself (checked on the server). */
export function assignableRoles(actor: Role, target: Role): Role[] {
  if (actor === "organiser") return [...ROLES];
  if (actor === "co_organiser" && (target === "attendee" || target === "speaker")) return ["attendee", "speaker"];
  return [];
}

/** Roles the actor may hand out through an invite link. */
export function inviteRoles(actor: Role): StaffRole[] {
  if (actor === "organiser") return ["speaker", "co_organiser", "organiser"];
  if (actor === "co_organiser") return ["speaker"];
  return [];
}

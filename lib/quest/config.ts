// DevFest Quest + Level Up game rules. All values are PROPOSED in the developer guide;
// tune them here.

/** Event day in Africa/Lagos (WAT). Phase 2 features switch on for this date. */
export const EVENT_DAY = process.env.QUEST_EVENT_DAY ?? "2026-10-17";

/** Points that count before event day. Points beyond it are kept and count from event day. */
export const PRE_EVENT_CAP = 100;

export const POINTS = {
  profile: 10,
  quiz: 5,
  streak: 5,
  follow: 10,
  community: 15,
  xPost: 5,
  checkin: 20,
  /** Squad Up: each person you connect with by scanning (both of you). */
  meet: 20,
  room: 5,
  /** Partners: each partner stand you scan. */
  booth: 25,
  recap: 10,
  invite: 20,
  mission: 25,
  /** Quiz rounds: each correct answer. */
  roundAnswer: 10,
} as const;

/** The four stages, in unlock order. */
export const STAGES = [
  { id: "socials", num: 1, title: "Follow the Signal", short: "Socials", blurb: "Follow GDG Jos on every platform.", color: "#4285F4" },
  { id: "squad", num: 2, title: "Squad Up", short: "Squad", blurb: "Meet people and scan their QR. You both score.", color: "#EA4335" },
  { id: "quiz", num: 3, title: "Brain Blitz", short: "Quiz", blurb: "10 questions. 60 seconds. 3 rounds.", color: "#F9AB00" },
  { id: "partners", num: 4, title: "Partner Link-up", short: "Partners", blurb: "Visit 3 partner stands and scan their code.", color: "#34A853" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

/** People to connect with before Brain Blitz and Partners unlock. Every one after that still scores. */
export const SQUAD_GOAL = 3;
export const PARTNER_GOAL = 3;
export const ROUND_SECONDS = 60;
export const ROUND_QUESTIONS = 10;
/** Seconds to wait after a wrong guess about someone before trying again. */
export const SQUAD_RETRY_SECONDS = 30;

/** Preset avatars: geometric DevFest characters (see AvatarArt). The id is stored on the profile. */
const AV_COLORS = ["#4285F4", "#EA4335", "#F9AB00", "#34A853"] as const;
const AV_HEADS = ["round", "square", "hex", "dome"] as const;
const AV_EYES = ["dots", "visor", "code", "wink"] as const;
export const AVATARS = Array.from({ length: 16 }, (_, i) => {
  const row = Math.floor(i / 4);
  return {
    id: `a${i + 1}`,
    head: AV_HEADS[i % 4],
    eyes: AV_EYES[row],
    bg: AV_COLORS[(i + row) % 4],
    accent: AV_COLORS[(i + row + 2) % 4],
  };
});

export const avatarFor = (id: string | null | undefined) => AVATARS.find((a) => a.id === id) ?? null;

export const LIMITS = {
  xPostsPerDay: 3,
  invitesPaid: 5,
  meetsPerHour: 40,
  connectsPerHour: 30,
  /** Seconds each entrance code lives; the previous code is also accepted. */
  checkinWindow: 30,
} as const;

export const STACKS = [
  { label: "AI", color: "#4285F4", tint: "#C3ECF6" },
  { label: "Flutter", color: "#57CAFF", tint: "#C3ECF6" },
  { label: "Android", color: "#34A853", tint: "#CCF6C5" },
  { label: "Web", color: "#F9AB00", tint: "#FFE7A5" },
  { label: "Cloud", color: "#4285F4", tint: "#C3ECF6" },
  { label: "Security", color: "#EA4335", tint: "#F8D8D8" },
  { label: "Design", color: "#FF7DAF", tint: "#F8D8D8" },
  { label: "Product", color: "#F9AB00", tint: "#FFE7A5" },
  { label: "Founder", color: "#EA4335", tint: "#F8D8D8" },
  { label: "Student", color: "#34A853", tint: "#CCF6C5" },
  { label: "Just exploring", color: "#FF7DAF", tint: "#F8D8D8" },
] as const;

export const STACK_LABELS: readonly string[] = STACKS.map((s) => s.label);

export const TRACKS = ["AI and Agents", "Mobile", "Web", "Cloud and Security", "Product and Career"] as const;

export const FOLLOWS = [
  { id: "x", short: "X", name: "X", handle: "@gdgjos2", href: "https://x.com/gdgjos2", tint: "#E4E4E4" },
  { id: "instagram", short: "IG", name: "Instagram", handle: "@gdg_jos", href: "https://www.instagram.com/gdg_jos", tint: "#F8D8D8" },
  {
    id: "linkedin",
    short: "in",
    name: "LinkedIn",
    handle: "Google Developer Groups Jos",
    href: "https://www.linkedin.com/company/google-developer-groups-jos-gdg/",
    tint: "#C3ECF6",
  },
  { id: "facebook", short: "f", name: "Facebook", handle: "gdgjos", href: "https://www.facebook.com/gdgjos", tint: "#C3ECF6" },
] as const;

export const COMMUNITY_JOIN_URL = "https://gdg.community.dev/gdg-jos/";

/** Placeholders until the official hashtags are confirmed (open question in the guide). */
export const HASHTAGS = ["#DevFestJos", "#DevFest2026"] as const;
export const X_MENTION = "@gdgjos2";

/** Tints for initials avatars, picked by a stable hash of the user id. */
export const AVATAR_TINTS = ["#C3ECF6", "#CCF6C5", "#FFE7A5", "#F8D8D8"] as const;

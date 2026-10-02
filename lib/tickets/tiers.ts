// Ticket tiers. Shared by the landing page, the checkout UI and the server.
// The server always prices orders from this file, never from the client.

export type TierId = "regular" | "vip" | "padi";

export type Tier = {
  id: TierId;
  name: string;
  tagline: string;
  /** Price per unit in kobo (₦1 = 100 kobo). 0 = free registration. */
  priceKobo: number;
  /** Tickets issued per unit bought (My Padi = 2 people). */
  seatsPerUnit: number;
  maxUnits: number;
  /** Optional cap on tickets issued for this tier. null = no cap. */
  capacity: number | null;
  perks: string[];
  tone: "paper" | "blue" | "yellow";
  badge?: string;
};

export const tiers: Record<TierId, Tier> = {
  regular: {
    id: "regular",
    name: "Regular",
    tagline: "Full access to the talks, workshops and community.",
    priceKobo: 0,
    seatsPerUnit: 1,
    maxUnits: 1,
    capacity: null,
    perks: ["All talks and workshops", "Networking with the community", "Partner booths and demos"],
    tone: "paper",
  },
  vip: {
    id: "vip",
    name: "VIP",
    tagline: "Everything in Regular, plus swag and lunch on us.",
    priceKobo: 8_000_00,
    seatsPerUnit: 1,
    maxUnits: 4,
    capacity: null,
    perks: ["Everything in Regular", "DevFest swag pack", "Lunch and refreshments"],
    tone: "blue",
    badge: "Most popular",
  },
  padi: {
    id: "padi",
    name: "My Padi",
    tagline: "You and a friend, same VIP perks, for less.",
    priceKobo: 15_000_00,
    seatsPerUnit: 2,
    maxUnits: 2,
    capacity: null,
    perks: ["2 VIP tickets", "A swag pack each", "Lunch and refreshments for two"],
    tone: "yellow",
    badge: "Save ₦1,000",
  },
};

export const tierList = [tiers.regular, tiers.vip, tiers.padi];

export const isTierId = (v: unknown): v is TierId => typeof v === "string" && v in tiers;

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export const formatNaira = (kobo: number) => ngn.format(kobo / 100);

export const priceLabel = (t: Tier) => (t.priceKobo === 0 ? "Free" : formatNaira(t.priceKobo));

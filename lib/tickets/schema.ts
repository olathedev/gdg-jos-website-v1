import { z } from "zod";
import { tiers, type TierId } from "./tiers";

const name = z.string().trim().min(2, "Enter a full name").max(80, "That name is too long");
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const attendeeSchema = z.object({ name, email });

export const checkoutSchema = z
  .object({
    tier: z.enum(["regular", "vip", "padi"]),
    units: z.number().int().min(1),
    buyer: z.object({
      name,
      email,
      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
    }),
    attendees: z.array(attendeeSchema).min(1),
    /** Honeypot: real people never fill this in. */
    company: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    const tier = tiers[v.tier as TierId];
    if (v.units > tier.maxUnits) {
      ctx.addIssue({ code: "custom", path: ["units"], message: `You can buy up to ${tier.maxUnits} at once` });
    }
    if (v.attendees.length !== v.units * tier.seatsPerUnit) {
      ctx.addIssue({ code: "custom", path: ["attendees"], message: "Add details for every ticket holder" });
    }
    const seen = new Set<string>();
    v.attendees.forEach((a, i) => {
      if (seen.has(a.email)) {
        ctx.addIssue({ code: "custom", path: ["attendees", i, "email"], message: "Each ticket needs its own email" });
      }
      seen.add(a.email);
    });
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Flatten zod issues into { "buyer.email": "message" } for the form. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

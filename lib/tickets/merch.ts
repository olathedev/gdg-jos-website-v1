import { z } from "zod";

export const shirtSizes = ["S", "M", "L", "XL", "XXL"] as const;
export const shirtColors = ["green", "blue", "red", "yellow"] as const;
export type MerchFields = { merch: "" | "shirt" | "tote"; shirtSize: string; shirtColor: string };
export const merchSchema = z.object({
  merch: z.enum(["shirt", "tote"], { error: "Choose a shirt or a tote bag" }),
  shirtSize: z.enum(shirtSizes).optional(),
  shirtColor: z.enum(shirtColors).optional(),
}).superRefine((value, ctx) => {
  if (value.merch === "shirt" && !value.shirtSize) {
    ctx.addIssue({ code: "custom", path: ["shirtSize"], message: "Choose your shirt size" });
  }
  if (value.merch === "shirt" && !value.shirtColor) {
    ctx.addIssue({ code: "custom", path: ["shirtColor"], message: "Choose your shirt colour" });
  }
}).transform((value) => ({ ...value, shirtSize: value.merch === "shirt" ? value.shirtSize : undefined, shirtColor: value.merch === "shirt" ? value.shirtColor : undefined }));

export const existingMerchSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/, "Enter the ticket code shown on your ticket (XXXX-XXXX)"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  selection: merchSchema,
});

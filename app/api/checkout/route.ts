import { NextResponse } from "next/server";
import { ConfigError } from "@/lib/tickets/db";
import { sendTicketEmails } from "@/lib/tickets/email";
import { AlreadyRegisteredError, SoldOutError, createOrder, markEmailed } from "@/lib/tickets/orders";
import { PaystackError, initializeTransaction } from "@/lib/tickets/paystack";
import { checkoutSchema, fieldErrors } from "@/lib/tickets/schema";
import { siteUrl } from "@/lib/tickets/site";
import { tiers } from "@/lib/tickets/tiers";

export const runtime = "nodejs";

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ error, fields }, { status });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return fail(422, "Check the highlighted fields.", fieldErrors(parsed.error));
  const input = parsed.data;
  if (input.company) return fail(400, "Something went wrong. Please try again.");

  const site = siteUrl(req);
  try {
    const { order, tickets } = await createOrder(input);

    if (order.status === "free") {
      if (await sendTicketEmails(order, tickets, site)) await markEmailed(order.id);
      return NextResponse.json({ kind: "free", reference: order.reference });
    }

    const init = await initializeTransaction({
      email: order.buyer_email,
      amountKobo: order.amount_kobo,
      reference: order.reference,
      callbackUrl: `${site}/tickets/order/${encodeURIComponent(order.reference)}`,
      metadata: {
        order_id: order.id,
        tier: order.tier,
        units: order.units,
        custom_fields: [
          { display_name: "Ticket", variable_name: "ticket", value: `${tiers[order.tier].name} × ${order.units}` },
          { display_name: "Name", variable_name: "name", value: order.buyer_name },
          { display_name: "Phone", variable_name: "phone", value: order.buyer_phone ?? "" },
        ],
      },
    });

    return NextResponse.json({
      kind: "paystack",
      reference: order.reference,
      accessCode: init.access_code,
      authorizationUrl: init.authorization_url,
    });
  } catch (e) {
    if (e instanceof AlreadyRegisteredError || e instanceof SoldOutError) return fail(409, e.message);
    if (e instanceof ConfigError) {
      console.error("[checkout] config:", e.message);
      return fail(503, "Ticket sales are being set up. Please try again shortly.");
    }
    if (e instanceof PaystackError) {
      console.error("[checkout] paystack:", e.message);
      return fail(502, "We couldn't reach our payment provider. Please try again.");
    }
    console.error("[checkout]", e);
    return fail(500, "Something went wrong on our side. Please try again.");
  }
}

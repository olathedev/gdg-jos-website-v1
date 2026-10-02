import { NextResponse } from "next/server";
import { verifyAndFulfil } from "@/lib/tickets/fulfil";
import { isValidWebhookSignature } from "@/lib/tickets/paystack";
import { siteUrl } from "@/lib/tickets/site";

export const runtime = "nodejs";

/**
 * Paystack webhook (set this URL in Dashboard → Settings → API Keys & Webhooks).
 * Backs up the confirm page: if a buyer closes the tab mid-payment, this still
 * issues and emails their tickets.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(raw) as { event: string; data?: { reference?: string } };
  const reference = payload.data?.reference;

  if (payload.event === "charge.success" && reference?.startsWith("DFJ26-")) {
    try {
      // Re-verify with the API rather than trusting the payload's amount.
      await verifyAndFulfil(reference, siteUrl(req));
    } catch (e) {
      console.error("[webhook]", reference, e);
      // 500 makes Paystack retry later.
      return NextResponse.json({ error: "Fulfilment failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}

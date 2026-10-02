import { NextResponse } from "next/server";
import { verifyAndFulfil } from "@/lib/tickets/fulfil";
import { getOrder } from "@/lib/tickets/orders";
import { PaystackError } from "@/lib/tickets/paystack";
import { siteUrl } from "@/lib/tickets/site";

export const runtime = "nodejs";

/** Called by the order page after Paystack's popup (or redirect) completes. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { reference?: unknown } | null;
  const reference = typeof body?.reference === "string" ? body.reference : "";
  if (!/^DFJ26-[A-Z0-9-]{8,40}$/.test(reference)) {
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }

  const existing = await getOrder(reference);
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (existing.order.status !== "pending") return NextResponse.json({ status: existing.order.status });

  try {
    const order = await verifyAndFulfil(reference, siteUrl(req));
    return NextResponse.json({ status: order?.status ?? "pending" });
  } catch (e) {
    // Paystack hasn't seen a completed payment for this reference yet.
    if (e instanceof PaystackError) return NextResponse.json({ status: "pending" });
    console.error("[verify]", e);
    return NextResponse.json({ error: "Could not confirm payment yet" }, { status: 500 });
  }
}

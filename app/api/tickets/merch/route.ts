import { db } from "@/lib/tickets/db";
import { existingMerchSchema } from "@/lib/tickets/merch";
import { fieldErrors } from "@/lib/tickets/schema";
import type { Order } from "@/lib/tickets/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = existingMerchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  const { code, email, selection } = parsed.data;
  try {
    const saved = await db().begin(async (sql) => {
      // Lock the order so different holders in the same purchase cannot overwrite each other.
      const [order] = await sql<Order[]>`
        select o.* from orders o join tickets t on t.order_id = o.id
        where t.code = ${code} and lower(t.holder_email) = ${email}
          and o.status = 'paid' and t.tier in ('vip', 'padi')
        for update of o`;
      if (!order) return false;
      if (!order.attendees.some((a) => a.email.toLowerCase() === email)) return false;
      const attendees = order.attendees.map((a) => a.email.toLowerCase() === email ? { ...a, merch: selection.merch, shirtSize: selection.shirtSize ?? null, shirtColor: selection.shirtColor ?? null } : a);
      await sql`update orders set attendees = ${sql.json(attendees)} where id = ${order.id}`;
      return true;
    });
    if (!saved) return Response.json({ error: "We couldn't match a paid ticket. Check your ticket code and the ticket holder's email." }, { status: 404 });
    return Response.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[merch] Could not save selection", error);
    return Response.json({ error: "We couldn't save your merch. Please try again." }, { status: 500 });
  }
}

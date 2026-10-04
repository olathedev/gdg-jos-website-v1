import { currentAdmin } from "@/lib/admin/auth";
import { ticketsCsv } from "@/lib/admin/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** All tickets as CSV (admins only). */
export async function GET() {
  if (!(await currentAdmin())) return new Response("Not found", { status: 404 });
  const csv = await ticketsCsv();
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="devfest-jos-2026-tickets-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

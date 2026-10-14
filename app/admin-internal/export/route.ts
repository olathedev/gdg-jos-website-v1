import { currentAdmin } from "@/lib/admin/auth";
import { allEmailsCsv, ticketsCsv } from "@/lib/admin/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Paid tickets by default; an explicit option exports all live-order emails. */
export async function GET(request: Request) {
  if (!(await currentAdmin())) return new Response("Not found", { status: 404 });
  const emails = new URL(request.url).searchParams.get("type") === "all-emails";
  const csv = emails ? await allEmailsCsv() : await ticketsCsv();
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="devfest-jos-2026-${emails ? "all-emails" : "paid-tickets"}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

import { timingSafeEqual } from "node:crypto";
import { recheckXPosts, syncXPosts } from "@/lib/quest/x";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Background jobs for DevFest Quest, called by a scheduler with
//   Authorization: Bearer <CRON_SECRET>
//   GET /api/quest/cron?job=x        every 15 minutes (search + queued links)
//   GET /api/quest/cron?job=recheck  once a day (deleted posts lose points)

function authorised(req: Request) {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  return Boolean(secret && secret.length >= 16 && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want)));
}

export async function GET(req: Request) {
  if (!authorised(req)) return new Response("Not found", { status: 404 });
  const job = new URL(req.url).searchParams.get("job");
  try {
    if (job === "x") return Response.json({ job, ...(await syncXPosts()) });
    if (job === "recheck") return Response.json({ job, ...(await recheckXPosts()) });
    return Response.json({ error: "job must be x or recheck" }, { status: 400 });
  } catch (e) {
    console.error("[quest cron]", job, e);
    return Response.json({ job, error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}

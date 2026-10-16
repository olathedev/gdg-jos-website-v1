import { NextResponse } from "next/server";
import { getMe } from "@/lib/quest/auth";
import { GameError, scanStation } from "@/lib/quest/game";
import { siteUrl } from "@/lib/tickets/site";

/** Printed room-door and booth QRs open this link in the phone camera. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const base = siteUrl(req);
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(code)) return NextResponse.redirect(`${base}/quest/event?r=unknown`);

  const me = await getMe();
  if (!me?.onboarded_at) return NextResponse.redirect(`${base}/quest?next=${encodeURIComponent(`/quest/s/${code}`)}`);

  try {
    const res = await scanStation(me.id, code);
    const page = res.kind === "booth" ? "stage/partners" : "event";
    return NextResponse.redirect(`${base}/quest/${page}?r=${res.fresh ? res.kind : "again"}${res.kind === "booth" ? `&n=${encodeURIComponent(res.name)}` : ""}`);
  } catch (e) {
    if (e instanceof GameError) {
      const page = e.code === "locked" ? "stage/partners" : "event";
      return NextResponse.redirect(`${base}/quest/${page}?r=${e.code ?? "unknown"}`);
    }
    throw e;
  }
}

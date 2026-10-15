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
    return NextResponse.redirect(`${base}/quest/event?r=${res.fresh ? res.kind : "again"}`);
  } catch (e) {
    if (e instanceof GameError) return NextResponse.redirect(`${base}/quest/event?r=${e.code ?? "unknown"}`);
    throw e;
  }
}

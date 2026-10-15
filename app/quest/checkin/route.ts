import { NextResponse } from "next/server";
import { getMe } from "@/lib/quest/auth";
import { entranceCodeValid } from "@/lib/quest/entrance";
import { checkIn } from "@/lib/quest/game";
import { CHECKIN_COOKIE, cookieOptions, seal } from "@/lib/quest/session";
import { phase } from "@/lib/quest/time";
import { siteUrl } from "@/lib/tickets/site";

/** The rotating entrance QR opens this link. The code is checked the moment it's opened. */
export async function GET(req: Request) {
  const base = siteUrl(req);
  if (phase() !== "event") return NextResponse.redirect(`${base}/quest/event?r=early`);
  const code = new URL(req.url).searchParams.get("c") ?? "";
  if (!entranceCodeValid(code)) return NextResponse.redirect(`${base}/quest/event?r=expired`);

  const me = await getMe();
  if (!me) {
    // Not signed in yet: hold the valid scan for 10 minutes while they sign in.
    const res = NextResponse.redirect(`${base}/quest`);
    res.cookies.set(CHECKIN_COOKIE, seal({ ok: true }, 600), cookieOptions(600));
    return res;
  }
  await checkIn(me.id);
  return NextResponse.redirect(`${base}/quest/event?r=checkedin`);
}

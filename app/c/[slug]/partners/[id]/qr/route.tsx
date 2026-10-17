import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { adminSiteUrl } from "@/lib/admin/site";
import { getMe } from "@/lib/quest/auth";
import { getCircle, roleOf } from "@/lib/quest/circles";
import { boothCode, isPartnerManager } from "@/lib/quest/partner-admin";
import { isStaff } from "@/lib/quest/roles";

/**
 * A printable booth QR (1000px wide, partner name underneath), drawn on the server so the booth
 * code never appears in any page. Circle staff, or that partner's managers, only.
 */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const [me, circle] = await Promise.all([getMe(), getCircle(slug)]);
  if (!me?.onboarded_at || !circle) return new Response("Not allowed", { status: 403 });
  if (!isStaff(await roleOf(circle.id, me)) && !(await isPartnerManager(me.id, id))) return new Response("Not allowed", { status: 403 });
  const booth = await boothCode(id);
  if (!booth) return new Response("Not found", { status: 404 });

  const qr = await QRCode.toDataURL(`${await adminSiteUrl()}/quest/s/${booth.code}`, { margin: 1, width: 900, errorCorrectionLevel: "H" });
  const file = `booth-qr-${booth.name.replace(/\W+/g, "-").toLowerCase()}.png`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL in an OG image */}
        <img src={qr} width={900} height={900} alt="" />
        <div style={{ fontSize: 64, fontWeight: 700, color: "#0A0A0A", textAlign: "center", maxWidth: 940 }}>{booth.name}</div>
      </div>
    ),
    {
      width: 1000,
      height: 1120,
      headers: { "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "private, no-store" },
    },
  );
}

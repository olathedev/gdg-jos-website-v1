import Link from "next/link";
import QRCode from "qrcode";
import { GameAvatar, gameBtnGhost } from "@/components/quest/ui";
import { adminSiteUrl } from "@/lib/admin/site";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS } from "@/lib/quest/config";
import { displayName, initials } from "@/lib/quest/validate";

export const metadata = { title: "My QR" };

export default async function Me() {
  const me = await requireAgent();
  const site = await adminSiteUrl();
  const qr = await QRCode.toString(`${site}/quest/meet/${me.quest_token}`, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0A0A0A", light: "#ffffff" },
  });

  return (
    <div className="flex flex-col items-center gap-5 pt-2 text-center">
      <span className="text-[11px] font-bold tracking-[0.2em] text-white/50">MY QUEST QR</span>

      <div className="quest-pop flex w-full max-w-[320px] flex-col items-center gap-4 rounded-[32px] bg-white p-5 text-ink">
        <div
          className="w-full [&>svg]:h-auto [&>svg]:w-full"
          role="img"
          aria-label={`Quest QR code for ${displayName(me.full_name, me.is_adult)}`}
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <div className="flex items-center gap-3">
          <GameAvatar avatar={me.avatar} initials={initials(me.full_name)} size={44} />
          <span className="type-heading text-xl font-bold">{displayName(me.full_name, me.is_adult)}</span>
        </div>
      </div>

      <p className="max-w-xs text-sm text-white/65">
        Other players tap Scan and point at this. They answer questions about you to lock you in for +{POINTS.meet}.
      </p>

      <Link href="/quest/profile" className={gameBtnGhost}>
        View my profile
      </Link>
    </div>
  );
}

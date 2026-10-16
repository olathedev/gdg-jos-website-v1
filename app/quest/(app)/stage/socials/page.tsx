import SocialsStage from "@/components/quest/SocialsStage";
import { StageHeader } from "@/components/quest/Stage";
import { requireAgent } from "@/lib/quest/auth";
import { FOLLOWS } from "@/lib/quest/config";
import { missions } from "@/lib/quest/game";

export const metadata = { title: "Follow the Signal" };

export default async function SocialsPage() {
  const me = await requireAgent();
  const m = await missions(me.id);
  const followed = m.followed.filter((id) => FOLLOWS.some((f) => f.id === id));
  return (
    <div className="flex flex-col gap-6">
      <StageHeader id="socials" progress={followed.length} goal={FOLLOWS.length} done={followed.length >= FOLLOWS.length} />
      <SocialsStage followed={followed} />
    </div>
  );
}

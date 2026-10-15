import Link from "next/link";
import PeopleList from "@/components/quest/PeopleList";
import { Blob } from "@/components/quest/ui";
import { requireAgent } from "@/lib/quest/auth";
import { POINTS } from "@/lib/quest/config";
import { crew, directory } from "@/lib/quest/game";
import { phase } from "@/lib/quest/time";

export const metadata = { title: "Who's coming" };

export default async function People() {
  const me = await requireAgent();
  const p = phase();
  const [agents, mine] = await Promise.all([p === "post" ? [] : directory(me.id), crew(me.id)]);

  return (
    <div className="flex flex-col gap-3.5 lg:gap-5">
      <div className="flex items-end justify-between gap-3">
        <h1 className="type-heading text-[38px] leading-none font-bold lg:text-5xl">
          Who&apos;s <span className="text-g-green">{p === "event" ? "here" : "coming"}</span>
        </h1>
        <span className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[13px] font-bold text-h-yellow">
          {agents.length} {agents.length === 1 ? "agent" : "agents"}
        </span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-normal text-[#5F5F5F]">
          {p === "event"
            ? "Agents checked in at the venue today. Find them and scan their QR."
            : p === "post"
              ? "The directory closed after DevFest. Your crew is still here."
              : "Agents who chose to be listed. On 17 Oct this becomes Who's here."}
        </p>
        <Link
          href="/quest/crew"
          className="flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-white px-4 text-sm font-bold hover:bg-white/70"
        >
          Your crew · {mine.connected.length}
          {mine.pending.length > 0 && (
            <span className="rounded-full bg-g-red px-2 py-0.5 text-xs text-white">{mine.pending.length} new</span>
          )}
        </Link>
      </div>

      {!me.is_adult && (
        <p className="rounded-3xl bg-p-yellow px-5 py-4 text-sm leading-normal">
          Connections are for agents 18 and over. You can still meet people at the venue, play Level Up and climb the board.
        </p>
      )}
      {!me.listed && me.is_adult && (
        <p className="rounded-3xl bg-white px-5 py-4 text-sm leading-normal">
          You&apos;re hidden from this list. Others can&apos;t find you until you turn on{" "}
          <Link href="/quest/setup" className="font-bold underline">
            Show me in Who&apos;s coming
          </Link>
          .
        </p>
      )}

      {p !== "post" && <PeopleList agents={agents} canConnect={me.is_adult} />}

      <Blob className="flex flex-col gap-1 bg-p-blue px-[18px] py-4">
        <span aria-hidden className="absolute top-3.5 right-5 size-[26px] rounded-full bg-g-blue" />
        <span className="text-[15px] font-bold">One tap to connect</span>
        <p className="max-w-xl text-[13px] leading-normal text-[#1E3A4A]">
          Contacts are shared only if they accept. Connecting online earns no points: meet and scan on 17 Oct to score{" "}
          {POINTS.meet} each.
        </p>
      </Blob>
    </div>
  );
}

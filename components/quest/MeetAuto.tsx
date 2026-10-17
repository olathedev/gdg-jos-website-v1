"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { meetAction } from "@/app/quest/actions";
import { POINTS } from "@/lib/quest/config";
import Loader from "./Loader";
import { GameAvatar, gameBtn, gameBtnGhost } from "./ui";

type Result = Awaited<ReturnType<typeof meetAction>>;

/** Runs the connection the moment the scan page opens: no extra tap. */
export default function MeetAuto({ token, avatar }: { token: string; avatar: string | null }) {
  const [res, setRes] = useState<Result | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    meetAction(token).then(setRes, () => setRes({ ok: false, message: "Something went wrong. Scan again." }));
  }, [token]);

  if (!res) return <Loader label="Connecting" />;

  if (!res.ok) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <GameAvatar avatar={avatar} size={88} />
        <h1 className="type-heading text-2xl font-bold">Couldn&apos;t connect</h1>
        <p className="max-w-xs text-sm text-white/65">{res.message}</p>
        <Link href="/quest/scan" className={gameBtn}>
          Scan again
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
      <div className="quest-pop relative">
        <GameAvatar avatar={res.avatar} size={110} className="ring-4 ring-g-green ring-offset-4 ring-offset-[#0A0A0A]" />
        <span className="absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full border-4 border-[#0A0A0A] bg-g-green text-white">
          <Check aria-hidden className="size-5" strokeWidth={3.5} />
        </span>
      </div>
      <span className="text-[11px] font-bold tracking-[0.2em] text-[#81C995]">{res.fresh ? "CONNECTED" : "ALREADY CONNECTED"}</span>
      <h1 className="type-heading text-3xl leading-tight font-bold">
        {res.fresh ? `You and ${res.name} are now padis` : `You and ${res.name} already met`}
      </h1>
      {res.fresh ? (
        <span className="quest-pop rounded-full bg-h-yellow px-4 py-1.5 text-lg font-black text-[#0A0A0A]">+{POINTS.meet} each</span>
      ) : (
        <p className="text-sm text-white/60">Each pair scores once. Go find someone new.</p>
      )}
      {res.connected && <p className="max-w-xs text-sm text-white/65">Their socials are now in your Padis.</p>}
      <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
        <Link href="/quest/scan" className={gameBtn}>
          Scan the next person
        </Link>
        <Link href={res.connected ? "/quest/crew" : "/quest/stage/padiup"} className={gameBtnGhost}>
          {res.connected ? "Open my padis" : "See my padis"}
        </Link>
      </div>
    </div>
  );
}

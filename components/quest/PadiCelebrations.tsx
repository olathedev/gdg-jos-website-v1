"use client";

import { useEffect, useState } from "react";
import { padisSeenAction } from "@/app/quest/actions";
import Celebration from "./Celebration";

/** For the other side of a new padi: plays once the next time they open the app. */
export default function PadiCelebrations({ padis }: { padis: { id: string; name: string }[] }) {
  const [show, setShow] = useState(padis.length > 0);
  const ids = padis.map((p) => p.id).join(",");
  useEffect(() => {
    // Mark seen straight away so it never plays twice, even if they navigate mid-animation.
    if (ids) void padisSeenAction(ids.split(","));
  }, [ids]);
  if (!show || !padis.length) return null;
  const message = padis.length === 1 ? `You and ${padis[0].name} are now padis!` : `You have ${padis.length} new padis!`;
  return <Celebration message={message} onDone={() => setShow(false)} />;
}

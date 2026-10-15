"use client";

import { useState } from "react";

export default function CopyLink({ url, className = "" }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        await navigator.share({ title: "Join me in Agent Mode at DevFest Jos", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* share sheet dismissed */
    }
  };
  return (
    <button type="button" onClick={copy} className={className}>
      <span aria-live="polite">{copied ? "Link copied" : "Copy my invite link"}</span>
    </button>
  );
}

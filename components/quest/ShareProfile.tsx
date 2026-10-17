"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

/** Copy link + Share (Web Share API where available, otherwise copy). */
export default function ShareProfile({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your link", url);
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} on PadiUp`, text: "Be my padi at DevFest Jos", url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    await copy();
  };
  const btn = "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-fg/15 text-sm font-bold hover:bg-fg/[0.05]";
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="truncate text-center text-xs text-fg/45" title={url}>
        {url.replace(/^https?:\/\//, "")}
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={copy} className={btn}>
          {copied ? <Check aria-hidden className="size-4 text-live" /> : <Copy aria-hidden className="size-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button type="button" onClick={share} className={btn}>
          <Share2 aria-hidden className="size-4" /> Share
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

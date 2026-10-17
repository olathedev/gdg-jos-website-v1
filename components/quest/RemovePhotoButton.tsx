"use client";

import { useState, useTransition } from "react";
import { removePhotoAction } from "@/app/c/actions";

/** Organisers and co-organisers: take down a member's photo (they go back to initials). Asks first. */
export default function RemovePhotoButton({ slug, userId, name }: { slug: string; userId: string; name: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        className="min-h-11 self-start rounded-full border border-g-red/40 px-3.5 text-sm font-bold text-bad hover:bg-g-red/10 disabled:opacity-50"
        onClick={() => {
          if (!window.confirm(`Remove ${name}'s photo? They'll show their initials until they pick an avatar.`)) return;
          start(async () => setMessage((await removePhotoAction(slug, userId))?.message ?? ""));
        }}
      >
        {pending ? "Removing…" : "Remove photo"}
      </button>
      {message && (
        <span role="status" className="text-xs font-bold text-fg/70">
          {message}
        </span>
      )}
    </span>
  );
}

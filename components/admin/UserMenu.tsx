"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/admin-internal/actions";
import { Avatar } from "./OrdersView";

export default function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-g-blue"
      >
        <Avatar name={email.split("@")[0].replace(/[._-]/g, " ")} size="size-8" />
        <span className="hidden max-w-[12rem] truncate text-sm font-medium sm:block">{email}</span>
        <ChevronDown aria-hidden className="size-4 text-zinc-400" />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-40 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-900/[0.06]">
          <p className="truncate px-3 pt-2 pb-1.5 text-xs text-zinc-500">{email}</p>
          <form action={logoutAction}>
            <button role="menuitem" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
              <LogOut aria-hidden className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { ArrowDown01Icon, Logout03Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/admin-internal/actions";
import type { Role } from "@/lib/admin/auth";
import Icon from "./Icon";

const roleLabel: Record<Role, string> = { owner: "Owner", superadmin: "Super admin", admin: "Admin", volunteer: "Volunteer" };

export default function UserMenu({ email, role }: { email: string; role: Role }) {
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
    <div ref={root} className="relative flex items-center gap-2">
      <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 sm:inline-flex">
        <Icon icon={SecurityCheckIcon} className="size-3.5" strokeWidth={2} /> {roleLabel[role]}
      </span>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 pr-2.5 pl-3.5 text-sm font-medium hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-g-blue"
      >
        <span className="max-w-[10rem] truncate sm:max-w-[16rem]">{email}</span>
        <Icon icon={ArrowDown01Icon} className="size-4 text-zinc-400" />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-40 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-900/[0.06]">
          <form action={logoutAction}>
            <button role="menuitem" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
              <Icon icon={Logout03Icon} className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

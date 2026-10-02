"use client";

import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { navLinks, ticketHref, ticketLabel } from "@/data/devfest26";
import { Logo, PillLink } from "./ui";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    menuButton.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main"
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full pr-2 pl-5 transition-all duration-300 ${
          scrolled ? "bg-ink/85 shadow-lg shadow-black/10 ring-1 ring-white/10 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <a href="#top" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue" aria-label="DevFest Jos 2026, back to top">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium tracking-wide text-white/80 uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-g-blue"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <PillLink href={ticketHref}>{ticketLabel}</PillLink>
          </span>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-full bg-white text-ink lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink px-5 pt-7 pb-10 text-white"
        >
          <div className="flex items-center justify-between pl-2">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-full bg-white text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <ul className="mt-14 flex flex-col gap-2">
            {navLinks.map((l, i) => (
              <li key={l.href}>
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="type-condensed block py-1 text-6xl transition-colors hover:text-h-yellow focus-visible:text-h-yellow focus-visible:outline-none"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <PillLink href={ticketHref} size="lg" className="mt-auto w-full">
            {ticketLabel}
          </PillLink>
        </div>
      )}
    </header>
  );
}

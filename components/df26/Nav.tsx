"use client";

import { AnimatePresence, motion as m } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { event, navLinks, ticketHref } from "@/data/devfest26";
import { Logo } from "./ui";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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
    const t = setTimeout(() => firstLink.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 lg:px-5 lg:pt-4">
      <nav
        aria-label="Main"
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 transition-[background-color,box-shadow,backdrop-filter] duration-300 sm:px-6 lg:h-14 lg:rounded-full lg:pr-2 lg:pl-5 ${
          scrolled ? "bg-ink/85 shadow-lg shadow-black/10 backdrop-blur-md lg:ring-1 lg:ring-white/10" : "bg-transparent"
        }`}
      >
        <Link href="/#top" className={`rounded-md ${focus}`} aria-label="DevFest Jos 2026 home">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={`rounded-full px-3.5 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white ${focus}`}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={ticketHref}
            className={`inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-white/85 lg:h-10 lg:px-5 ${focus}`}
          >
            Get tickets
          </a>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className={`-mr-1 grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden ${focus}`}
          >
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink text-white"
          >
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <Logo />
              <button type="button" onClick={close} aria-label="Close menu" className={`-mr-1 grid size-10 place-items-center rounded-full hover:bg-white/10 ${focus}`}>
                <X className="size-6" aria-hidden />
              </button>
            </div>

            <m.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              className="mt-4 px-4 sm:px-6"
            >
              {navLinks.map((l, i) => (
                <m.li key={l.href} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="border-b border-white/10">
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center justify-between py-4 ${focus}`}
                  >
                    <span className="type-heading text-3xl">{l.label}</span>
                    <ArrowUpRight aria-hidden className="size-5 text-white/40 transition-colors group-hover:text-white" />
                  </a>
                </m.li>
              ))}
            </m.ul>

            <div className="mt-auto space-y-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
              <p className="text-sm text-white/60">
                {event.dateLabel} · {event.venue}, {event.city}
              </p>
              <a
                href={ticketHref}
                onClick={() => setOpen(false)}
                className={`flex h-12 items-center justify-center rounded-full bg-white text-[15px] font-medium text-ink ${focus}`}
              >
                Get tickets
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}

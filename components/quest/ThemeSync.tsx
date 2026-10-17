"use client";

import { useEffect } from "react";
import { applyTheme, savedTheme } from "@/lib/quest/theme";

/** Follows the phone's light/dark setting live while the choice is "System". */
export default function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => savedTheme() === "system" && applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return null;
}

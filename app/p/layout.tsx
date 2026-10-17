import type { Metadata } from "next";
import Backdrop from "@/components/quest/Backdrop";

export const metadata: Metadata = { title: { default: "PadiUp · DevFest Jos 2026", template: "%s · PadiUp" }, robots: { index: false } };

/** Shared profile links live outside /quest but use the game's look. */
export default function ProfileLinkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="quest-night min-h-dvh text-white">
      <Backdrop />
      {children}
    </div>
  );
}

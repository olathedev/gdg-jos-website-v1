import type { Metadata } from "next";
import Backdrop from "@/components/quest/Backdrop";
import ThemeSync from "@/components/quest/ThemeSync";
import { themeScript } from "@/lib/quest/theme";

export const metadata: Metadata = { title: { default: "PadiUp · DevFest Jos 2026", template: "%s · PadiUp" }, robots: { index: false } };

/** Shared profile links live outside /quest but use the game's look and theme. */
export default function ProfileLinkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="quest-night min-h-dvh" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <ThemeSync />
      <Backdrop />
      {children}
    </div>
  );
}

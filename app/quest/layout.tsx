import type { Metadata } from "next";
import Backdrop from "@/components/quest/Backdrop";
import ThemeSync from "@/components/quest/ThemeSync";
import { themeScript } from "@/lib/quest/theme";

export const metadata: Metadata = {
  title: { default: "DevFest Quest · DevFest Jos 2026", template: "%s · DevFest Quest" },
  description: "The DevFest Jos game: four stages, one leaderboard. Follow, padi up, blitz the quiz and link up with partners.",
};

export default function QuestLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-quest-theme is set by the inline script before first paint (no flash).
    <div className="quest-night min-h-dvh" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <ThemeSync />
      <Backdrop />
      {children}
    </div>
  );
}

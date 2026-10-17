import type { Metadata } from "next";
import Backdrop from "@/components/quest/Backdrop";

export const metadata: Metadata = {
  title: { default: "DevFest Quest · DevFest Jos 2026", template: "%s · DevFest Quest" },
  description: "The DevFest Jos game: four stages, one leaderboard. Follow, padi up, blitz the quiz and link up with partners.",
};

export default function QuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="quest-night min-h-dvh text-white">
      <Backdrop />
      {children}
    </div>
  );
}

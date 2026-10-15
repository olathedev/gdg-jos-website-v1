import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Agent Mode · DevFest Jos 2026", template: "%s · Agent Mode" },
  description: "Meet people, learn something new every day and climb the leaderboard, before and at DevFest Jos on 17 Oct.",
};

export default function QuestLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}

import { Pill, ogCard, ogContentType, ogSize } from "@/lib/og/card";

export const alt = "DevFest Jos 2026: Build for the agentic era";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard({
    eyebrow: "DevFest Jos 2026",
    title: (
      <>
        <span>Build for the&nbsp;</span>
        <span style={{ color: "#4285f4" }}>agentic era</span>
      </>
    ),
    subtitle: "Talks, workshops and community for builders on the Plateau.",
    art: (
      <>
        <Pill label="Gemini" bg="#4285f4" color="#fff" x={870} y={56} rotate={8} />
        <Pill label="AI Agents" bg="#ffd427" x={950} y={130} rotate={-10} />
        <Pill label="Android" bg="#34a853" color="#fff" x={840} y={210} rotate={-4} />
        <Pill label="Flutter" bg="#57caff" x={1010} y={260} rotate={12} />
        <Pill label="Firebase" bg="#f9ab00" x={860} y={310} rotate={6} />
        <Pill label="Cloud" bg="#ea4335" color="#fff" x={950} y={380} rotate={-8} />
      </>
    ),
  });
}

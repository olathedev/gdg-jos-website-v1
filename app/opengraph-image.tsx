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
        <span style={{ color: "#57caff" }}>agentic era</span>
      </>
    ),
    subtitle: "Talks, workshops and community for builders on the Plateau.",
    art: (
      <>
        <Pill label="Gemini" bg="#4285f4" color="#fff" x={860} y={70} rotate={8} />
        <Pill label="AI Agents" bg="#ffd427" x={930} y={160} rotate={-10} />
        <Pill label="Android" bg="#34a853" color="#fff" x={820} y={250} rotate={-4} />
        <Pill label="Flutter" bg="#57caff" x={1000} y={300} rotate={14} />
        <Pill label="Firebase" bg="#f9ab00" x={880} y={380} rotate={6} />
        <Pill label="Cloud" bg="#ea4335" color="#fff" x={1040} y={440} rotate={-12} />
      </>
    ),
  });
}

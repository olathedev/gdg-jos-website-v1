import { Pill, ogCard, ogContentType, ogSize } from "@/lib/og/card";

// The same card for every profile link: no names, photos or anything personal in the image.
export const alt = "PadiUp at DevFest Jos 2026";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard({
    eyebrow: "PadiUp · DevFest Jos 2026",
    title: (
      <>
        <span>Let&apos;s be&nbsp;</span>
        <span style={{ color: "#34a853" }}>padis</span>
      </>
    ),
    subtitle: "Meet people at DevFest Jos, become padis and climb the leaderboard.",
    art: (
      <>
        <Pill label="Padi Up" bg="#ea4335" color="#fff" x={880} y={70} rotate={8} />
        <Pill label="Brain Blitz" bg="#ffd427" x={940} y={160} rotate={-10} />
        <Pill label="Partners" bg="#34a853" color="#fff" x={850} y={250} rotate={-4} />
        <Pill label="Leaderboard" bg="#4285f4" color="#fff" x={930} y={340} rotate={10} />
      </>
    ),
  });
}

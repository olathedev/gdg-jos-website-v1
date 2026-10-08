import { Pill, ogCard, ogContentType, ogSize } from "@/lib/og/card";

export const alt = "Meet the DevFest Jos 2026 volunteers";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard({
    eyebrow: "Volunteers",
    title: (
      <>
        <span>Meet the&nbsp;</span>
        <span style={{ color: "#ea4335" }}>crew.</span>
      </>
    ),
    subtitle: "The people behind registration, speakers, media and design.",
    art: (
      <>
        <Pill label="Registration" bg="#57caff" x={850} y={56} rotate={-8} />
        <Pill label="Social Media" bg="#ff7daf" x={900} y={134} rotate={6} />
        <Pill label="Design" bg="#ffd427" x={1030} y={212} rotate={-12} />
        <Pill label="Speakers" bg="#5cdb6d" x={830} y={262} rotate={8} />
        <Pill label="Partnerships" bg="#ffffff" x={870} y={345} rotate={-4} />
      </>
    ),
  });
}

import { Pill, ogCard, ogContentType, ogSize } from "@/lib/og/card";

export const alt = "Make your DevFest Jos 2026 DP";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard({
    eyebrow: "DP Maker",
    title: (
      <>
        <span>Tell everyone you&apos;ll be&nbsp;</span>
        <span style={{ color: "#ffd427" }}>there.</span>
      </>
    ),
    subtitle: "Make your DevFest Jos 2026 DP in seconds.",
    art: (
      <>
        <Pill label="Attendee" bg="#57caff" x={880} y={90} rotate={-8} />
        <Pill label="Speaker" bg="#ff7daf" x={940} y={190} rotate={7} />
        <Pill label="Volunteer" bg="#ffd427" x={860} y={290} rotate={-5} />
        <Pill label="Organiser" bg="#5cdb6d" x={950} y={390} rotate={10} />
      </>
    ),
  });
}

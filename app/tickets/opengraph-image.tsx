import { ogCard, ogContentType, ogSize } from "@/lib/og/card";

export const alt = "Get your DevFest Jos 2026 ticket";
export const size = ogSize;
export const contentType = ogContentType;

const stub = (name: string, price: string, bg: string, x: number, y: number, rotate: number) => (
  <div
    key={name}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 300,
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      color: "#1e1e1e",
      borderRadius: 24,
      border: "3px solid #1e1e1e",
      overflow: "hidden",
      transform: `rotate(${rotate}deg)`,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", background: bg, padding: "20px 24px", borderBottom: "3px dashed #1e1e1e" }}>
      <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 700, fontSize: 26 }}>{name}</div>
      <div style={{ display: "flex", fontFamily: "Clash", fontWeight: 600, fontSize: 52, marginTop: 6 }}>{price}</div>
    </div>
    <div style={{ display: "flex", padding: "14px 24px", fontFamily: "Sans", fontSize: 18, color: "#555" }}>DevFest Jos 2026</div>
  </div>
);

export default function Image() {
  return ogCard({
    eyebrow: "Tickets",
    title: (
      <>
        <span>Grab your&nbsp;</span>
        <span style={{ color: "#57caff" }}>spot.</span>
      </>
    ),
    subtitle: "Free registration · VIP ₦8,000 · My Padi ₦15,000 for two",
    art: (
      <>
        {stub("My Padi", "₦15,000", "#ccf6cf", 840, 210, 9)}
        {stub("VIP", "₦8,000", "#b8eef8", 800, 70, -6)}
      </>
    ),
  });
}

// The quest background: DevFest brand shapes drawn in outline down both edges, over a dot grid.
// Purely decorative; fixed behind everything.

const s = { fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const B = "#4285F4";
const R = "#EA4335";
const Y = "#F9AB00";
const G = "#34A853";

export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="absolute top-0 left-0 h-full text-fg w-auto opacity-[0.22] lg:opacity-60" viewBox="0 0 140 900" preserveAspectRatio="xMinYMin meet">
        {/* { brace */}
        <path d="M44 60c-14 0-18 6-18 18v26c0 9-5 13-14 13 9 0 14 4 14 13v26c0 12 4 18 18 18" stroke={B} {...s} strokeWidth={3} />
        <circle cx="96" cy="210" r="7" fill={R} />
        {/* pill */}
        <rect x="-30" y="300" width="96" height="34" rx="17" stroke={G} {...s} transform="rotate(-18 18 317)" />
        {/* sting squiggle */}
        <path d="M14 470c26-8 22 34 46 28s8-44 34-46" stroke={Y} {...s} strokeWidth={2.5} />
        <path d="M108 446l8 8-8 8-8-8z" stroke={Y} {...s} />
        <path d="M30 600h12M36 594v12" stroke="currentColor" strokeOpacity="0.35" {...s} />
        {/* half disc */}
        <path d="M-2 700a40 40 0 0 1 80 0z" fill={B} opacity="0.85" />
        <rect x="70" y="790" width="34" height="34" rx="9" stroke={R} {...s} transform="rotate(14 87 807)" />
      </svg>

      <svg className="absolute top-0 right-0 h-full text-fg w-auto opacity-[0.22] lg:opacity-60" viewBox="0 0 140 900" preserveAspectRatio="xMaxYMin meet">
        <circle cx="104" cy="96" r="26" stroke={Y} {...s} strokeWidth={2.5} />
        <path d="M70 150h12M76 144v12" stroke="currentColor" strokeOpacity="0.35" {...s} />
        {/* hexagon */}
        <path d="M118 262l24 14v28l-24 14-24-14v-28z" stroke={G} {...s} />
        <rect x="60" y="390" width="110" height="38" rx="19" fill={R} opacity="0.9" transform="rotate(22 115 409)" />
        {/* } brace */}
        <path d="M96 520c14 0 18 6 18 18v26c0 9 5 13 14 13-9 0-14 4-14 13v26c0 12-4 18-18 18" stroke={G} {...s} strokeWidth={3} />
        <circle cx="56" cy="700" r="5" fill={Y} />
        <circle cx="112" cy="770" r="34" stroke={B} {...s} strokeDasharray="4 8" />
        <path d="M52 850l10-10 10 10-10 10z" fill={B} />
      </svg>
    </div>
  );
}

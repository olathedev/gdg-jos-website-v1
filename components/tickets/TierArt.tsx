import { Braces, QuarterCircle, Ring, Squiggle, Star4 } from "@/components/df26/ui";
import type { TierId } from "@/lib/tickets/tiers";

/**
 * DevFest shape clusters used behind a selected ticket. Shapes stay on the right
 * so the name and price on the left remain readable.
 */
export default function TierArt({ tier, compact = false, className = "" }: { tier: TierId; compact?: boolean; className?: string }) {
  if (compact) return <CompactArt tier={tier} className={className} />;
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {tier === "regular" && (
        <>
          <Ring className="absolute -top-10 -right-10 w-32 text-g-green/35" />
          <Braces className="absolute -right-3 -bottom-4 w-24 rotate-[-8deg] text-g-green" />
          <Star4 className="absolute top-[42%] right-[34%] w-6 text-g-yellow" />
          <span className="absolute right-[22%] bottom-[46%] size-3 rounded-full bg-g-blue" />
        </>
      )}
      {tier === "vip" && (
        <>
          <QuarterCircle className="absolute -top-2 -right-2 w-24 rotate-90 text-g-blue/30" />
          <Star4 className="absolute right-4 bottom-4 w-14 text-g-blue" />
          <Star4 className="absolute right-[30%] bottom-[38%] w-6 text-g-yellow" />
          <Squiggle className="absolute right-[18%] bottom-[18%] w-16 rotate-[-12deg] text-g-red" />
        </>
      )}
      {tier === "padi" && (
        <>
          <Ring className="absolute -right-6 -bottom-8 w-28 text-g-yellow" />
          <Ring className="absolute right-12 -bottom-10 w-24 text-g-red/80" />
          <Braces className="absolute -top-3 right-2 w-16 rotate-[10deg] text-ink/15" />
          <Star4 className="absolute right-[32%] bottom-[40%] w-6 text-g-blue" />
        </>
      )}
    </span>
  );
}

/** Small cards: shapes hug the top-right and bottom-right corners only. */
function CompactArt({ tier, className }: { tier: TierId; className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {tier === "regular" && (
        <>
          <Ring className="absolute -top-8 -right-8 w-24 text-g-green/30" />
          <Braces className="absolute -right-2 -bottom-2 w-12 rotate-[-8deg] text-g-green" />
          <Star4 className="absolute right-3 bottom-[42%] w-4 text-g-yellow" />
        </>
      )}
      {tier === "vip" && (
        <>
          <QuarterCircle className="absolute -top-1 -right-1 w-20 rotate-90 text-g-blue/25" />
          <Star4 className="absolute -right-2 -bottom-2 w-12 text-g-blue" />
          <Star4 className="absolute right-3 bottom-[42%] w-4 text-g-yellow" />
        </>
      )}
      {tier === "padi" && (
        <>
          <Braces className="absolute -top-2 right-10 w-10 rotate-[10deg] text-ink/15" />
          <Ring className="absolute -right-5 -bottom-5 w-14 text-g-yellow" />
          <Ring className="absolute -right-1 -bottom-9 w-12 text-g-red/80" />
          <Star4 className="absolute right-3 bottom-[42%] w-4 text-g-blue" />
        </>
      )}
    </span>
  );
}

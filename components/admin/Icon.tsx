import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

export type IconData = NonNullable<ComponentProps<typeof HugeiconsIcon>["icon"]>;

/** Hugeicons with admin defaults (size via className, consistent stroke). */
export default function Icon({ icon, className = "size-[18px]", strokeWidth = 1.8 }: { icon: IconData; className?: string; strokeWidth?: number }) {
  return <HugeiconsIcon icon={icon} size="100%" strokeWidth={strokeWidth} className={`shrink-0 ${className}`} aria-hidden />;
}

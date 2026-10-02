import Image from "next/image";

/**
 * Darkened event photo behind a dark header. Place inside a `relative isolate`
 * container; it sits behind everything else in that container.
 */
export default function PhotoBackdrop({ src, priority = false, position = "center" }: { src: string; priority?: boolean; position?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Image src={src} alt="" fill priority={priority} sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      {/* Strong overlay keeps white text well above AA contrast. */}
      <div className="absolute inset-0 bg-ink/80" />
      <div className="absolute inset-0 bg-linear-to-b from-ink/30 via-transparent to-ink" />
    </div>
  );
}

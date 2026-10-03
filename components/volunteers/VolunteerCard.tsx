import Image from "next/image";
// import { volunteers as volunteers2025 } from "@/data/data";
import { /* returningVolunteers2025, */ volunteers2026 } from "@/data/devfest26";
import { facePortrait } from "@/lib/cloudinary-loader";

export type Volunteer = { name: string; role: string; image: string; group: "2026" | "2025"; zoom?: boolean };

const crew: Volunteer[] = volunteers2026.map((v) => ({ ...v, group: "2026" }));
// 2025 alumni are hidden for now. To show them again, uncomment this block, the two
// imports above, and swap `people`/`groups` below for the commented versions.
// const alumni: Volunteer[] = volunteers2025
//   .filter((v) => !returningVolunteers2025.includes(v.name))
//   .map((v) => ({ name: v.name, role: v.role, image: v.image, zoom: "zoom" in v ? Boolean(v.zoom) : false, group: "2025" }));

// export const people = [...crew, ...alumni];
export const people = crew;
// export const groups = [
//   { id: "2026", label: "2026 crew", count: crew.length },
//   { id: "2025", label: "2025 alumni", count: alumni.length },
// ] as const;
export const groups: { id: string; label: string; count: number }[] = [];
export const crewCount = crew.length;

const tints = ["bg-p-blue", "bg-p-red", "bg-p-yellow", "bg-p-green"];

export function VolunteerCard({ name, role, image, zoom, index = 0 }: Volunteer & { index?: number }) {
  // Local photos are already square crops; Cloudinary ones get a face-centred crop.
  const src = image.startsWith("/") ? image : facePortrait(image, { zoom });
  return (
    <li className="group">
      <div className={`relative aspect-square overflow-hidden rounded-2xl ${tints[index % tints.length]}`}>
        <Image
          src={src}
          alt={name}
          fill
          sizes="(min-width: 1024px) 12rem, (min-width: 640px) 25vw, 45vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 text-[15px] leading-tight font-semibold">{name}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-ink/60">{role}</p>
    </li>
  );
}

export const gridCls = "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

/** First few of the 2026 crew, for the landing section. */
export function VolunteerPreview({ count = 6 }: { count?: number }) {
  return (
    <ul className={gridCls}>
      {crew.slice(0, count).map((v, i) => (
        <VolunteerCard key={v.name} {...v} index={i} />
      ))}
    </ul>
  );
}

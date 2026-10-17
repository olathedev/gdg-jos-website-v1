import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartnerEditor } from "@/components/quest/PartnerEditor";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { requireAgent } from "@/lib/quest/auth";
import { getCircle, roleOf } from "@/lib/quest/circles";
import { editablePartners, isPartnerManager } from "@/lib/quest/partner-admin";
import { isStaff } from "@/lib/quest/roles";

export const metadata = { title: "Edit partner" };

/** A partner's own managers edit its public profile here (circle staff get every field). */
export default async function EditPartnerPage({ params }: PageProps<"/quest/stage/partners/[slug]/edit">) {
  const me = await requireAgent();
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();
  const [circle, list] = await Promise.all([getCircle(), editablePartners()]);
  const partner = list.find((p) => p.slug === slug);
  if (!partner || !circle) notFound();
  const role = await roleOf(circle.id, me);
  const scope = isStaff(role) ? "full" : (await isPartnerManager(me.id, partner.id)) ? "public" : null;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Link href={`/quest/stage/partners/${slug}`} className="flex min-h-11 items-center gap-1.5 self-start text-sm font-bold text-fg/60 hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" /> {partner.name}
      </Link>
      {!scope ? (
        <p className="rounded-[24px] border border-fg/[0.08] bg-surface px-5 py-10 text-center text-sm text-fg/65">
          You&apos;re not allowed to edit this partner. Ask an organiser to add you as one of its managers.
        </p>
      ) : (
        <>
          <h1 className="type-heading text-[26px] leading-tight font-bold">Edit {partner.name}</h1>
          <PartnerEditor slug={circle.slug} partner={partner} scope={scope} canUpload={cloudinaryEnabled()} isOrganiser={role === "organiser"} />
        </>
      )}
    </div>
  );
}

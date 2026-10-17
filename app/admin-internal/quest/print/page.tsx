import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import PrintButton from "@/components/admin/PrintButton";
import { adminEnabled, adminPath, currentAdmin } from "@/lib/admin/auth";
import { adminSiteUrl } from "@/lib/admin/site";
import { listPartners } from "@/lib/quest/admin";
import { POINTS } from "@/lib/quest/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partner QR codes · Print", robots: { index: false, follow: false } };

/** One partner per A4 page: big QR, name and how to play. Print from the browser. */
export default async function PrintPartners() {
  if (!adminEnabled()) notFound();
  const base = `/${adminPath()}`;
  if (!(await currentAdmin())) redirect(base);
  const [partners, site] = await Promise.all([listPartners(), adminSiteUrl()]);
  const pages = await Promise.all(
    partners.map(async (p) => ({
      ...p,
      svg: await QRCode.toString(`${site}/quest/s/${p.code}`, { type: "svg", margin: 0, errorCorrectionLevel: "H", color: { dark: "#0A0A0A", light: "#ffffff" } }),
    })),
  );

  return (
    <main className="min-h-dvh bg-zinc-100 text-[#0A0A0A] print:bg-white">
      <style>{`@page { size: A4; margin: 0; } @media print { .no-print { display: none !important; } }`}</style>
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-3">
        <p className="text-sm text-zinc-600">
          {pages.length} partner {pages.length === 1 ? "page" : "pages"}. Print on A4, one per stand.
        </p>
        <div className="flex items-center gap-3">
          <a href={`${base}/quest`} className="text-sm font-medium text-zinc-600 hover:text-ink">
            Back
          </a>
          <PrintButton />
        </div>
      </div>

      {pages.length === 0 && <p className="p-10 text-center text-zinc-500">No partners yet. Add them on the DevFest Quest admin page.</p>}

      {pages.map((p) => (
        <section
          key={p.id}
          className="mx-auto my-6 flex h-[297mm] w-[210mm] flex-col items-center justify-between bg-white px-[18mm] py-[20mm] shadow-sm break-after-page print:my-0 print:shadow-none"
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-2xl font-bold">
              <span className="text-[#4285F4]">{"{"}</span>DevFest<span className="text-[#F9AB00]">{"}"}</span>
              <span className="ml-2 rounded-full bg-[#0A0A0A] px-2.5 py-1 align-middle text-xs font-bold text-white">JOS &apos;26</span>
            </span>
            <span className="text-sm font-bold tracking-[0.2em] text-[#34A853]">STAGE 4 · PARTNER LINK-UP</span>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="type-heading text-[44pt] leading-tight font-bold">{p.name}</h1>
            <div className="size-[120mm] [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: p.svg }} />
            <p className="type-heading text-[26pt] font-bold">
              Scan me · <span className="text-[#34A853]">+{POINTS.booth} points</span>
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-2 text-center">
            <p className="text-[13pt] text-zinc-700">Ask us what we do, then scan with the DevFest Quest Scan button or your phone camera.</p>
            <span aria-hidden className="flex gap-2">
              {["#EA4335", "#F9AB00", "#34A853", "#4285F4"].map((c) => (
                <span key={c} className="size-3 rounded-full" style={{ background: c }} />
              ))}
            </span>
          </div>
        </section>
      ))}
    </main>
  );
}

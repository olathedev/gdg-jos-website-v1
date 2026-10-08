"use client";

import { Download, ImagePlus, Loader2, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { event } from "@/data/devfest26";

const SIZE = 1080;

// The official DevFest Jos 2026 DP artwork (1080 × 1080). Only the photo is drawn on top.
const TEMPLATE_SRC = "/dp/template.png";
// The white photo frame inside the artwork's black border, on the 1080 canvas.
const FRAME = { x: 584, y: 448, w: 328, h: 397 };

type Photo = { img: HTMLImageElement; zoom: number; ox: number; oy: number };

function cssFont(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

/** Clamp the photo offset so it always covers the frame. */
function clampPhoto(p: Photo): Photo {
  const s = Math.max(FRAME.w / p.img.width, FRAME.h / p.img.height) * p.zoom;
  const maxX = (p.img.width * s - FRAME.w) / 2;
  const maxY = (p.img.height * s - FRAME.h) / 2;
  return { ...p, ox: Math.max(-maxX, Math.min(maxX, p.ox)), oy: Math.max(-maxY, Math.min(maxY, p.oy)) };
}

function draw(ctx: CanvasRenderingContext2D, o: { photo: Photo | null; template: HTMLImageElement | null }) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  if (o.template) ctx.drawImage(o.template, 0, 0, SIZE, SIZE);

  const { x, y, w, h } = FRAME;
  if (o.photo) {
    const p = o.photo;
    const s = Math.max(w / p.img.width, h / p.img.height) * p.zoom;
    const iw = p.img.width * s;
    const ih = p.img.height * s;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(p.img, x + w / 2 - iw / 2 + p.ox, y + h / 2 - ih / 2 + p.oy, iw, ih);
    ctx.restore();
  } else if (o.template) {
    ctx.fillStyle = "rgba(30,30,30,0.35)";
    ctx.font = `700 30px ${cssFont("--font-google-sans", "sans-serif")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Your photo here", x + w / 2, y + h / 2);
  }
}

const noopSubscribe = () => () => {};
let fileShareSupport: boolean | null = null;
/** Mobile browsers that can share an image file straight to apps. */
function detectFileShare() {
  if (fileShareSupport === null) {
    try {
      const probe = new File([new Blob(["x"], { type: "image/png" })], "probe.png", { type: "image/png" });
      fileShareSupport = typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] });
    } catch {
      fileShareSupport = false;
    }
  }
  return fileShareSupport;
}

export default function DpMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [template, setTemplate] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canShareFiles = useSyncExternalStore(noopSubscribe, detectFileShare, () => false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Assets: template artwork + the font for the empty-frame hint
  useEffect(() => {
    const img = new Image();
    img.onload = () => setTemplate(img);
    img.src = TEMPLATE_SRC;
    document.fonts
      .load(`700 30px ${cssFont("--font-google-sans", "sans-serif")}`)
      .catch(() => {})
      .finally(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(ctx, { photo, template });
  }, [photo, template, fontsReady]);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("That file isn't an image. Try a JPG or PNG.");
    if (file.size > 15 * 1024 * 1024) return setError("That image is over 15 MB. Try a smaller one.");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPhoto({ img, zoom: 1, ox: 0, oy: 0 });
    img.onerror = () => setError("We couldn't read that image. Try a JPG or PNG.");
    img.src = url;
  };

  // Drag to reposition the photo inside the circle
  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!photo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || !photo) return;
    const k = SIZE / e.currentTarget.clientWidth;
    const dx = (e.clientX - drag.current.x) * k;
    const dy = (e.clientY - drag.current.y) * k;
    drag.current = { x: e.clientX, y: e.clientY };
    setPhoto((p) => (p ? clampPhoto({ ...p, ox: p.ox + dx, oy: p.oy + dy }) : p));
  };
  const onPointerUp = () => (drag.current = null);

  const fileName = "devfest-jos-2026-dp.png";
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  const caption = `I'll be at #DevFestJos 2026! 🎉 ${event.dateLabel} at ${event.venue}, ${event.city}. Hosted by @gdgjos2. Get your ticket and make your own DP: ${site}/dp`;

  const blob = useCallback(
    () => new Promise<Blob>((res, rej) => canvasRef.current?.toBlob((b) => (b ? res(b) : rej(new Error("render failed"))), "image/png")),
    [],
  );

  const download = async () => {
    const b = await blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const ready = () => {
    if (!photo) {
      setError("Add your photo first.");
      fileRef.current?.focus();
      return false;
    }
    setError(null);
    return true;
  };

  const run = async (fn: () => Promise<void>) => {
    if (!ready()) return;
    setBusy(true);
    try {
      await fn();
    } catch {
      // user cancelled a share sheet, or the browser blocked it
    } finally {
      setBusy(false);
    }
  };

  const shareTo = (network: "x" | "whatsapp" | "linkedin") =>
    run(async () => {
      await download();
      await navigator.clipboard?.writeText(caption).catch(() => {});
      const text = encodeURIComponent(caption);
      const url = {
        x: `https://twitter.com/intent/tweet?text=${text}`,
        whatsapp: `https://wa.me/?text=${text}`,
        linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${text}`,
      }[network];
      window.open(url, "_blank", "noopener,noreferrer");
      setNotice("Your DP is downloaded and the caption is copied. Attach the image to your post.");
    });

  const nativeShare = () =>
    run(async () => {
      const file = new File([await blob()], fileName, { type: "image/png" });
      await navigator.share({ files: [file], text: caption });
    });

  const label = "mb-2.5 block text-sm font-semibold";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-12">
      {/* Controls */}
      <div className="order-2 space-y-7 rounded-3xl bg-white p-6 ring-1 ring-ink/10 sm:p-8 lg:order-1">
        <div>
          <span className={label}>Your photo</span>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="sr-only" id="dp-photo" />
          <label
            htmlFor="dp-photo"
            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 text-[15px] font-medium transition-colors hover:border-ink/50 hover:bg-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-g-blue"
          >
            <ImagePlus aria-hidden className="size-5" />
            {photo ? "Change photo" : "Upload a photo"}
          </label>
          {photo && (
            <div className="mt-4">
              <label htmlFor="dp-zoom" className="flex justify-between text-sm text-ink/60">
                <span>Zoom</span>
                <span>Drag the preview to reposition</span>
              </label>
              <input
                id="dp-zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={photo.zoom}
                onChange={(e) => setPhoto((p) => (p ? clampPhoto({ ...p, zoom: Number(e.target.value) }) : p))}
                className="mt-2 w-full accent-ink"
              />
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-ink/10 pt-6">
          <button
            type="button"
            onClick={() => run(download)}
            disabled={busy}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:opacity-70"
          >
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Download aria-hidden className="size-4" />}
            Download my DP
          </button>
          {canShareFiles && (
            <button
              type="button"
              onClick={nativeShare}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-h-yellow py-3.5 text-[15px] font-medium text-ink ring-2 ring-ink transition-colors hover:bg-p-yellow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue disabled:opacity-70"
            >
              <Share2 aria-hidden className="size-4" /> Share image
            </button>
          )}
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["x", "X"],
                ["whatsapp", "WhatsApp"],
                ["linkedin", "LinkedIn"],
              ] as const
            ).map(([id, text]) => (
              <button
                key={id}
                type="button"
                onClick={() => shareTo(id)}
                disabled={busy}
                className="h-11 rounded-full bg-paper text-sm font-medium ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue disabled:opacity-70"
              >
                {text}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            {error && <p className="rounded-xl bg-p-red px-4 py-3 text-sm font-medium text-[#a50e0e]">{error}</p>}
            {notice && !error && <p className="rounded-xl bg-p-green px-4 py-3 text-sm text-ink">{notice}</p>}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 lg:sticky lg:top-24 lg:order-2">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label="Preview of your DevFest Jos 2026 DP"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`aspect-square w-full rounded-3xl shadow-xl shadow-ink/10 ring-1 ring-ink/10 ${photo ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
        />
        <p className="mt-3 text-center text-sm text-ink/55">1080 × 1080 · perfect for profile pictures and status.</p>
      </div>
    </div>
  );
}

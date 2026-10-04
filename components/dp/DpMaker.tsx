"use client";

import { Check, Download, ImagePlus, Loader2, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { event } from "@/data/devfest26";

const SIZE = 1080;
const INK = "#1e1e1e";

const themes = {
  blue: { label: "Blue", strong: "#4285f4", pastel: "#c3ecf6" },
  red: { label: "Red", strong: "#ea4335", pastel: "#f8d8d8" },
  yellow: { label: "Yellow", strong: "#f9ab00", pastel: "#ffe7a5" },
  green: { label: "Green", strong: "#34a853", pastel: "#ccf6c5" },
} as const;
type ThemeId = keyof typeof themes;

const roles = ["Attendee", "Speaker", "Panelist", "Volunteer", "Organiser", "Partner"] as const;
type Role = (typeof roles)[number];

// What the caption says the person is doing at DevFest.
const doing: Record<Role | "none", string> = {
  none: "I'll be at",
  Attendee: "I'll be at",
  Speaker: "I'm speaking at",
  Panelist: "I'm on the panel at",
  Volunteer: "I'm volunteering at",
  Organiser: "I'm organising",
  Partner: "We're partnering with",
};

// Photo circle on the 1080 canvas.
const CIRCLE = { x: 540, y: 430, r: 255 };

type Photo = { img: HTMLImageElement; zoom: number; ox: number; oy: number };

function cssFont(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r * 0.06, cy - r * 0.06, cx + r, cy);
  ctx.quadraticCurveTo(cx + r * 0.06, cy + r * 0.06, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.06, cy + r * 0.06, cx - r, cy);
  ctx.quadraticCurveTo(cx - r * 0.06, cy - r * 0.06, cx, cy - r);
  ctx.fill();
}

function pill(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, font: string, bg: string, fg: string, padX: number, h: number) {
  ctx.font = font;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, y + h / 2 + 2);
  return w;
}

/** Clamp the photo offset so it always covers the circle. */
function clampPhoto(p: Photo): Photo {
  const d = CIRCLE.r * 2;
  const s = Math.max(d / p.img.width, d / p.img.height) * p.zoom;
  const maxX = (p.img.width * s - d) / 2;
  const maxY = (p.img.height * s - d) / 2;
  return { ...p, ox: Math.max(-maxX, Math.min(maxX, p.ox)), oy: Math.max(-maxY, Math.min(maxY, p.oy)) };
}

function draw(ctx: CanvasRenderingContext2D, o: { photo: Photo | null; name: string; role: Role | null; theme: ThemeId; divider: HTMLImageElement | null }) {
  const t = themes[o.theme];
  const heading = cssFont("--font-clash-display", "sans-serif");
  const sans = cssFont("--font-google-sans", "sans-serif");

  // Background + grid
  ctx.fillStyle = t.pastel;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = "rgba(30,30,30,0.07)";
  ctx.lineWidth = 2;
  for (let i = 54; i < SIZE; i += 54) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  // Decorative DevFest shapes
  ctx.fillStyle = t.strong;
  star(ctx, 900, 250, 70);
  ctx.fillStyle = INK;
  star(ctx, 960, 360, 26);
  ctx.strokeStyle = t.strong;
  ctx.lineWidth = 34;
  ctx.beginPath(); ctx.arc(150, 600, 85, 0, Math.PI * 2); ctx.stroke();
  ctx.font = `700 190px ${sans}`;
  ctx.fillStyle = t.strong;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.save(); ctx.translate(120, 330); ctx.rotate(-0.18); ctx.fillText("{", 0, 0); ctx.restore();
  ctx.save(); ctx.translate(880, 680); ctx.rotate(0.15); ctx.fillText("}", 0, 0); ctx.restore();

  // Wordmark
  ctx.font = `700 46px ${sans}`;
  const parts = [{ t: "{", c: "#4285f4" }, { t: " DevFest ", c: INK }, { t: "}", c: "#f9ab00" }];
  const markW = parts.reduce((w, p) => w + ctx.measureText(p.t).width, 0);
  const chipFont = `700 26px ${sans}`;
  ctx.font = chipFont;
  const chipW = ctx.measureText("JOS '26").width + 36;
  let x = SIZE / 2 - (markW + 16 + chipW) / 2;
  ctx.font = `700 46px ${sans}`;
  ctx.textBaseline = "middle";
  for (const p of parts) {
    ctx.fillStyle = p.c;
    ctx.fillText(p.t, x, 92);
    x += ctx.measureText(p.t).width;
  }
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.roundRect(x + 16, 70, chipW, 46, 23); ctx.fill();
  ctx.font = chipFont;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("JOS '26", x + 16 + chipW / 2, 95);

  // Photo circle: offset "sticker" shadow, photo, ink ring
  const { x: cx, y: cy, r } = CIRCLE;
  ctx.fillStyle = t.strong;
  ctx.beginPath(); ctx.arc(cx + 18, cy + 18, r + 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  if (o.photo) {
    const p = o.photo;
    const s = Math.max((r * 2) / p.img.width, (r * 2) / p.img.height) * p.zoom;
    const w = p.img.width * s;
    const h = p.img.height * s;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(p.img, cx - w / 2 + p.ox, cy - h / 2 + p.oy, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(30,30,30,0.35)";
    ctx.font = `700 34px ${sans}`;
    ctx.textAlign = "center";
    ctx.fillText("Your photo here", cx, cy);
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  // Name (shrinks to fit)
  const name = o.name.trim() || "Your Name";
  let size = 76;
  ctx.font = `600 ${size}px ${heading}`;
  while (ctx.measureText(name).width > 900 && size > 40) {
    size -= 2;
    ctx.font = `600 ${size}px ${heading}`;
  }
  ctx.fillStyle = o.name.trim() ? INK : "rgba(30,30,30,0.35)";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, SIZE / 2, 790);

  // Role pill
  let y = 818;
  if (o.role) {
    pill(ctx, o.role.toUpperCase(), SIZE / 2, y, `700 28px ${sans}`, INK, "#ffffff", 30, 56);
    y += 76;
  } else {
    y += 18;
  }

  // Tagline + event line
  ctx.fillStyle = INK;
  ctx.font = `700 34px ${sans}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`${doing[o.role ?? "none"]} DevFest Jos 2026!`, SIZE / 2, y + 30);
  ctx.font = `400 26px ${sans}`;
  ctx.fillStyle = "rgba(30,30,30,0.75)";
  ctx.fillText(`${event.dateLabel} · ${event.venue}, ${event.city}`, SIZE / 2, y + 72);

  // Divider strip
  if (o.divider) {
    const h = (SIZE * 82) / 1440;
    ctx.drawImage(o.divider, 0, SIZE - h, SIZE, h);
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
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>("Attendee");
  const [theme, setTheme] = useState<ThemeId>("blue");
  const [divider, setDivider] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canShareFiles = useSyncExternalStore(noopSubscribe, detectFileShare, () => false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Assets: divider artwork + fonts used on the canvas
  useEffect(() => {
    const img = new Image();
    img.onload = () => setDivider(img);
    img.src = "/divider.svg";
    const heading = cssFont("--font-clash-display", "sans-serif");
    const sans = cssFont("--font-google-sans", "sans-serif");
    Promise.all([document.fonts.load(`600 60px ${heading}`), document.fonts.load(`700 30px ${sans}`), document.fonts.load(`400 30px ${sans}`)])
      .catch(() => {})
      .finally(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(ctx, { photo, name, role, theme, divider });
  }, [photo, name, role, theme, divider, fontsReady]);

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

  const fileName = `devfest-jos-2026-${(name.trim() || "dp").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  const caption = `${doing[role ?? "none"]} #DevFestJos 2026! 🎉 ${event.dateLabel} at ${event.venue}, ${event.city}. Hosted by @gdgjos2. Get your ticket and make your own DP: ${site}/dp`;

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

        <div>
          <label htmlFor="dp-name" className={label}>
            Your name
          </label>
          <input
            id="dp-name"
            value={name}
            maxLength={40}
            autoComplete="name"
            placeholder="e.g. Ada Lovelace"
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-xl bg-paper/60 px-4 text-base ring-1 ring-ink/10 outline-none ring-inset placeholder:text-ink/40 focus:bg-white focus:ring-2 focus:ring-g-blue"
          />
        </div>

        <fieldset>
          <legend className={label}>
            Role <span className="font-normal text-ink/50">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRole(active ? null : r)}
                  className={`h-10 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue ${
                    active ? "bg-ink text-white" : "bg-paper text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label}>Theme colour</legend>
          <div className="flex gap-3">
            {(Object.keys(themes) as ThemeId[]).map((id) => {
              const active = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  aria-label={themes[id].label}
                  onClick={() => setTheme(id)}
                  style={{ backgroundColor: themes[id].strong }}
                  className={`grid size-11 place-items-center rounded-full text-white transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue ${
                    active ? "scale-110 ring-4 ring-ink/80 ring-offset-2" : "hover:scale-105"
                  }`}
                >
                  {active && <Check aria-hidden className="size-5" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </fieldset>

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
        <p className="mt-3 text-center text-sm text-ink/55">1080 × 1080 · perfect for profile pictures and status</p>
      </div>
    </div>
  );
}

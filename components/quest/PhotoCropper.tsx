"use client";

import { RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { gameBtn, gameBtnGhost } from "./ui";

// Square photo editor for profile pictures: drag to move, pinch / slider / wheel to zoom, rotate.
// The result is a VIEW×VIEW square; the app shows it in a circle.

const VIEW = 640;
const MAX_ZOOM = 4;

type Crop = { zoom: number; ox: number; oy: number; rot: number };
const START: Crop = { zoom: 1, ox: 0, oy: 0, rot: 0 };

/** Image size once rotated, and the scale at which it just covers the square. */
function fit(img: HTMLImageElement, rot: number) {
  const turned = rot % 180 !== 0;
  const w = turned ? img.naturalHeight : img.naturalWidth;
  const h = turned ? img.naturalWidth : img.naturalHeight;
  return { w, h, cover: Math.max(VIEW / w, VIEW / h) };
}

/** Keep the photo covering the whole square. */
function clamp(img: HTMLImageElement, c: Crop): Crop {
  const zoom = Math.min(MAX_ZOOM, Math.max(1, c.zoom));
  const { w, h, cover } = fit(img, c.rot);
  const maxX = (w * cover * zoom - VIEW) / 2;
  const maxY = (h * cover * zoom - VIEW) / 2;
  return { ...c, zoom, ox: Math.max(-maxX, Math.min(maxX, c.ox)), oy: Math.max(-maxY, Math.min(maxY, c.oy)) };
}

function draw(canvas: HTMLCanvasElement, img: HTMLImageElement, c: Crop) {
  const ctx = canvas.getContext("2d")!;
  const k = canvas.width / VIEW;
  const s = fit(img, c.rot).cover * c.zoom * k;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2 + c.ox * k, canvas.height / 2 + c.oy * k);
  ctx.rotate((c.rot * Math.PI) / 180);
  ctx.drawImage(img, (-img.naturalWidth * s) / 2, (-img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  ctx.restore();
}

export default function PhotoCropper({
  image,
  busy,
  error,
  onCancel,
  onDone,
}: {
  image: HTMLImageElement;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onDone: (canvas: HTMLCanvasElement) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const [crop, setCrop] = useState<Crop>(START);
  const set = (fn: (c: Crop) => Crop) => setCrop((c) => clamp(image, fn(c)));

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, image, crop);
  }, [image, crop]);

  // Escape closes (reading the latest props); the page behind doesn't scroll while editing.
  const latest = useRef({ busy, onCancel });
  useEffect(() => {
    latest.current = { busy, onCancel };
  });
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && !latest.current.busy && latest.current.onCancel();
    window.addEventListener("keydown", onKey);
    canvasRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /** Screen pixels to square pixels. */
  const k = () => VIEW / (canvasRef.current?.clientWidth || VIEW);
  const spread = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) pinch.current = spread();
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const last = pointers.current.get(e.pointerId);
    if (!last) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const now = spread();
      const ratio = now / pinch.current;
      pinch.current = now;
      set((c) => ({ ...c, zoom: c.zoom * ratio }));
    } else if (pointers.current.size === 1) {
      const dx = (e.clientX - last.x) * k();
      const dy = (e.clientY - last.y) * k();
      set((c) => ({ ...c, ox: c.ox + dx, oy: c.oy + dy }));
    }
  };
  const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const step = 24;
    const moves: Record<string, (c: Crop) => Crop> = {
      ArrowLeft: (c) => ({ ...c, ox: c.ox - step }),
      ArrowRight: (c) => ({ ...c, ox: c.ox + step }),
      ArrowUp: (c) => ({ ...c, oy: c.oy - step }),
      ArrowDown: (c) => ({ ...c, oy: c.oy + step }),
      "+": (c) => ({ ...c, zoom: c.zoom + 0.1 }),
      "=": (c) => ({ ...c, zoom: c.zoom + 0.1 }),
      "-": (c) => ({ ...c, zoom: c.zoom - 0.1 }),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      set(move);
    }
  };

  const iconBtn =
    "flex size-11 shrink-0 items-center justify-center rounded-full border border-fg/15 text-fg hover:bg-fg/[0.06] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-h-yellow";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-h"
        className="flex max-h-dvh w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-[28px] border border-fg/10 bg-surface p-5 sm:rounded-[28px]"
      >
        <div className="flex flex-col gap-0.5 text-center">
          <h2 id="crop-h" className="type-heading text-xl font-bold">
            Adjust your photo
          </h2>
          <p className="text-xs text-fg/60">Drag to move. Pinch or use the slider to zoom.</p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl bg-black">
          <canvas
            ref={canvasRef}
            width={VIEW}
            height={VIEW}
            tabIndex={0}
            aria-label="Photo crop area. Use arrow keys to move and plus or minus to zoom."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => set((c) => ({ ...c, zoom: c.zoom - e.deltaY * 0.002 }))}
            onKeyDown={onKeyDown}
            className="size-full cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:ring-4 focus-visible:ring-h-yellow"
          />
          {/* The circle players will see; outside it is dimmed. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/80" />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={iconBtn} aria-label="Zoom out" onClick={() => set((c) => ({ ...c, zoom: c.zoom - 0.2 }))}>
            <ZoomOut aria-hidden className="size-5" />
          </button>
          <label className="flex-1">
            <span className="sr-only">Zoom</span>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={crop.zoom}
              onChange={(e) => set((c) => ({ ...c, zoom: Number(e.target.value) }))}
              className="h-11 w-full accent-h-yellow"
            />
          </label>
          <button type="button" className={iconBtn} aria-label="Zoom in" onClick={() => set((c) => ({ ...c, zoom: c.zoom + 0.2 }))}>
            <ZoomIn aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          <button type="button" className={gameBtnGhost} onClick={() => set((c) => ({ ...c, rot: (c.rot + 90) % 360 }))}>
            <RotateCw aria-hidden className="size-4" /> Rotate
          </button>
          <button type="button" className={gameBtnGhost} onClick={() => setCrop(START)}>
            <Undo2 aria-hidden className="size-4" /> Reset
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-full border border-g-red/40 bg-g-red/10 px-4 py-2.5 text-center text-sm font-bold text-bad">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button type="button" className={`${gameBtnGhost} flex-1`} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`${gameBtn} min-h-12 flex-1`}
            disabled={busy}
            onClick={() => {
              const out = document.createElement("canvas");
              out.width = VIEW;
              out.height = VIEW;
              draw(out, image, crop);
              onDone(out);
            }}
          >
            {busy ? "Uploading…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}

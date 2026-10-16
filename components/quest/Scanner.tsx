"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gameBtn } from "./ui";

// In-app QR scanner. Uses the browser's BarcodeDetector where it exists (Chrome on Android)
// and falls back to jsQR (Safari). Only DevFest Quest links are followed: player codes
// (/quest/meet/…) and partner codes (/quest/s/…), always on this site.

type Status = "starting" | "scanning" | "denied" | "nocamera" | "found";

const QUEST_PATH = /^\/quest\/(meet\/[A-Za-z0-9_-]{16,40}|s\/[A-Za-z0-9_-]{4,40})\/?$/;

function questPath(text: string) {
  try {
    const url = new URL(text.trim(), window.location.origin);
    return QUEST_PATH.test(url.pathname) ? url.pathname.replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

export default function Scanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [miss, setMiss] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus("starting");
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let missTimer: ReturnType<typeof setTimeout> | undefined;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return setStatus("nocamera");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch (e) {
        const name = e instanceof DOMException ? e.name : "";
        return setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "nocamera");
      }
      if (stopped || !video.current) return stream.getTracks().forEach((t) => t.stop());
      video.current.srcObject = stream;
      await video.current.play().catch(() => {});
      setStatus("scanning");

      const Native = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
      const detector = Native ? new Native({ formats: ["qr_code"] }) : null;
      const jsQR = detector ? null : (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const tick = async () => {
        if (stopped) return;
        const v = video.current;
        if (v && v.readyState >= 2 && v.videoWidth) {
          let text: string | null = null;
          try {
            if (detector) {
              text = (await detector.detect(v))[0]?.rawValue ?? null;
            } else if (jsQR && ctx) {
              const scale = Math.min(1, 640 / v.videoWidth);
              canvas.width = Math.round(v.videoWidth * scale);
              canvas.height = Math.round(v.videoHeight * scale);
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              text = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" })?.data ?? null;
            }
          } catch {
            text = null;
          }
          if (text) {
            const path = questPath(text);
            if (path) {
              stopped = true;
              stream?.getTracks().forEach((t) => t.stop());
              navigator.vibrate?.(60);
              setStatus("found");
              router.push(path);
              return;
            }
            setMiss(true);
            clearTimeout(missTimer);
            missTimer = setTimeout(() => setMiss(false), 2200);
          }
        }
        timer = setTimeout(tick, 160);
      };
      void tick();
    }

    void start();
    return () => {
      stopped = true;
      clearTimeout(timer);
      clearTimeout(missTimer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [router, attempt]);

  const blocked = status === "denied" || status === "nocamera";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative aspect-square w-full max-w-[340px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#121212]">
        <video ref={video} playsInline muted className={`size-full object-cover ${blocked ? "hidden" : ""}`} />
        {/* Viewfinder corners in the four Google colours */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M18 32V24a6 6 0 0 1 6-6h8" stroke="#4285F4" vectorEffect="non-scaling-stroke" />
          <path d="M68 18h8a6 6 0 0 1 6 6v8" stroke="#EA4335" vectorEffect="non-scaling-stroke" />
          <path d="M82 68v8a6 6 0 0 1-6 6h-8" stroke="#34A853" vectorEffect="non-scaling-stroke" />
          <path d="M32 82h-8a6 6 0 0 1-6-6v-8" stroke="#F9AB00" vectorEffect="non-scaling-stroke" />
        </svg>
        {status === "starting" && (
          <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/60">Starting camera…</p>
        )}
        {status === "found" && (
          <p className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/70 text-sm font-bold">Got it. Opening…</p>
        )}
        {blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm font-bold">{status === "denied" ? "Camera is blocked" : "No camera found"}</p>
            <p className="text-xs leading-relaxed text-white/60">
              {status === "denied"
                ? "Allow camera access for this site in your browser settings, then try again. You can also scan with your phone's camera app."
                : "Scan with your phone's camera app instead. The code opens DevFest Quest."}
            </p>
          </div>
        )}
      </div>

      <p role="status" className={`min-h-5 text-sm font-semibold ${miss ? "text-[#F8D8D8]" : "text-white/60"}`}>
        {miss ? "That's not a DevFest Quest code." : status === "scanning" ? "Hold the code inside the frame." : ""}
      </p>

      {blocked && (
        <button type="button" onClick={retry} className={gameBtn}>
          Try again
        </button>
      )}
    </div>
  );
}

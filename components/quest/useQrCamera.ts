"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Camera QR reading shared by the player scanner and the door check-in screen. Uses the
// browser's BarcodeDetector where it exists (Chrome on Android) and jsQR elsewhere (Safari).

export type CameraStatus = "starting" | "scanning" | "denied" | "nocamera" | "stopped";
type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

/**
 * `onCode` gets every decoded text; return true to stop the camera (e.g. navigating away).
 * While `paused`, frames are skipped but the camera stays on so resuming is instant.
 */
export function useQrCamera(onCode: (text: string) => boolean | void, paused = false) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [attempt, setAttempt] = useState(0);
  const handler = useRef(onCode);
  const pausedRef = useRef(paused);
  useEffect(() => {
    handler.current = onCode;
    pausedRef.current = paused;
  });

  const retry = useCallback(() => {
    setStatus("starting");
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const stop = () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
    };

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
        if (!pausedRef.current && v && v.readyState >= 2 && v.videoWidth) {
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
          if (text && handler.current(text) === true) {
            stop();
            setStatus("stopped");
            return;
          }
        }
        timer = setTimeout(tick, 160);
      };
      void tick();
    }

    void start();
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [attempt]);

  return { video, status, retry };
}

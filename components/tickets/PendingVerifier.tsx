"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 3000;
const MAX_TRIES = 20; // ~1 minute

/** Polls the verify endpoint until Paystack confirms, then re-renders the page with tickets. */
export default function PendingVerifier({ reference }: { reference: string }) {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const check = async () => {
      tries++;
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = (await res.json()) as { status?: string };
        if (data.status && data.status !== "pending") {
          router.refresh();
          return;
        }
      } catch {
        // network blip: keep trying
      }
      if (stopped) return;
      if (tries >= MAX_TRIES) setGaveUp(true);
      else timer = setTimeout(check, INTERVAL_MS);
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reference, router]);

  if (gaveUp) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-ink/10">
        <h2 className="type-heading text-3xl">Still confirming your payment</h2>
        <p className="mx-auto mt-3 max-w-md text-ink/70">
          Paystack hasn&apos;t confirmed this payment yet. If you were charged, your tickets will be emailed as soon as
          it does. You can safely close this page.
        </p>
        <button
          type="button"
          onClick={() => location.reload()}
          className="mt-6 h-12 rounded-full bg-ink px-6 text-sm font-semibold tracking-wide text-white uppercase hover:bg-g-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-g-blue"
        >
          Check again
        </button>
      </div>
    );
  }

  return (
    <div role="status" className="rounded-[2rem] bg-white p-10 text-center ring-1 ring-ink/10">
      <Loader2 aria-hidden className="mx-auto size-10 animate-spin text-g-blue" />
      <h2 className="type-heading mt-5 text-3xl">Confirming your payment…</h2>
      <p className="mt-2 text-ink/70">This usually takes a few seconds. Please keep this page open.</p>
    </div>
  );
}

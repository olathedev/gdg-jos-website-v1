import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ConfigError } from "./db";

// Overridable so tests can point at a local mock.
const API = process.env.PAYSTACK_API_BASE ?? "https://api.paystack.co";

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new ConfigError("PAYSTACK_SECRET_KEY is not set");
  return key;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => null)) as { status: boolean; message: string; data: T } | null;
  if (!res.ok || !body?.status) {
    throw new PaystackError(body?.message ?? `Paystack responded ${res.status}`, res.status);
  }
  return body.data;
}

export class PaystackError extends Error {
  constructor(message: string, public httpStatus: number) {
    super(message);
  }
}

export function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  return call<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
}

export type PaystackTransaction = {
  id: number;
  status: "success" | "failed" | "abandoned" | "ongoing" | "pending" | "processing" | "queued" | "reversed";
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  channel: string;
  customer: { email: string };
};

export function verifyTransaction(reference: string) {
  return call<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Webhooks are signed with HMAC-SHA512 of the raw body using the secret key. */
export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

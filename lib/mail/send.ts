import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

export type Outgoing = { to: string; subject: string; html: string; text?: string };

const from = () => process.env.EMAIL_FROM ?? "DevFest Jos <tickets@devfestjos.com>";
const replyTo = () => process.env.EMAIL_REPLY_TO || undefined;

let client: Resend | null = null;
const resend = () => (client ??= new Resend(process.env.RESEND_API_KEY));

/** Dev fallback: write the email to disk so it can be previewed. */
async function saveLocally(m: Outgoing) {
  try {
    const dir = path.join(process.cwd(), ".dev-emails");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}-${m.to.replace(/[^a-z0-9]/gi, "_")}.html`);
    await writeFile(file, m.html);
    console.info(`[email] RESEND_API_KEY not set. Saved "${m.subject}" for ${m.to} to ${file}`);
  } catch {
    console.warn(`[email] RESEND_API_KEY not set and could not save preview for ${m.to}`);
  }
}

/** Send one email. Throws if Resend rejects it. */
export async function sendMail(m: Outgoing) {
  if (!process.env.RESEND_API_KEY) return saveLocally(m);
  const { error } = await resend().emails.send({ from: from(), replyTo: replyTo(), ...m });
  if (error) throw new Error(`Resend: ${error.message}`);
}

const BATCH = 100; // Resend's batch limit
const PAUSE_MS = 600; // stay under the default 2 requests/second

/** Send many emails in batches of 100. Returns how many went out and who failed. */
export async function sendMany(list: Outgoing[]) {
  let sent = 0;
  const failed: string[] = [];
  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH);
    if (i > 0) await new Promise((r) => setTimeout(r, PAUSE_MS));
    if (!process.env.RESEND_API_KEY) {
      await Promise.all(chunk.map(saveLocally));
      sent += chunk.length;
      continue;
    }
    try {
      const { error } = await resend().batch.send(chunk.map((m) => ({ from: from(), replyTo: replyTo(), ...m })));
      if (error) throw new Error(error.message);
      sent += chunk.length;
    } catch (e) {
      console.error("[email] batch failed", e);
      failed.push(...chunk.map((m) => m.to));
    }
  }
  return { sent, failed };
}

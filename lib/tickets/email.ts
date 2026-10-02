import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { event } from "@/data/devfest26";
import type { Order, Ticket } from "./orders";
import { tiers } from "./tiers";
import { calendarUrl } from "./calendar";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function ticketCard(t: Ticket, site: string) {
  const tier = tiers[t.tier];
  const accent = t.tier === "regular" ? "#34a853" : t.tier === "vip" ? "#4285f4" : "#f9ab00";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid #e6e6e6">
    <tr><td style="background:${accent};height:8px;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="padding:24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td valign="top" style="font-family:Arial,Helvetica,sans-serif;color:#1e1e1e">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666">${esc(tier.name)} ticket</div>
          <div style="font-size:22px;font-weight:bold;margin:6px 0 2px">${esc(t.holder_name)}</div>
          <div style="font-size:13px;color:#666">${esc(t.holder_email)}</div>
          <div style="font-size:13px;margin-top:16px;line-height:1.6">
            <b>${esc(event.dateLabel ?? "")}</b><br>${esc(event.venue ?? "")}${event.address ? `, ${esc(event.address)}` : ""}, ${esc(event.city)}
          </div>
          <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:bold;letter-spacing:3px;margin-top:16px">${esc(t.code)}</div>
        </td>
        <td width="132" valign="top" align="right">
          <img src="${site}/api/tickets/${encodeURIComponent(t.code)}/qr" width="120" height="120" alt="QR code for ticket ${esc(t.code)}" style="display:block;border:0">
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

function render(order: Order, tickets: Ticket[], recipientName: string, site: string) {
  const orderUrl = `${site}/tickets/order/${encodeURIComponent(order.reference)}`;
  const many = tickets.length > 1;
  return `<!doctype html><html><body style="margin:0;background:#f0f0f0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:24px 12px">
  <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="background:#1e1e1e;border-radius:24px 24px 0 0;padding:28px 28px 24px;font-family:Arial,Helvetica,sans-serif">
      <div style="font-size:22px;font-weight:bold;color:#ffffff"><span style="color:#4285f4">{</span> DevFest <span style="color:#f9ab00">}</span> <span style="font-size:12px;background:#fff;color:#1e1e1e;border-radius:99px;padding:2px 8px;vertical-align:middle">JOS '26</span></div>
      <div style="font-size:34px;line-height:1.05;font-weight:bold;color:#ffffff;margin-top:24px;text-transform:uppercase">You're in${many ? ", all of you" : ""}.</div>
      <div style="font-size:15px;color:#cfcfcf;margin-top:10px">Hi ${esc(recipientName.split(" ")[0])}, ${many ? "here are your tickets" : "here's your ticket"} for DevFest Jos 2026. Show the QR code at the door.</div>
    </td></tr>
    <tr><td style="background:#fbf7ee;padding:24px 20px 8px;border-radius:0 0 24px 24px">
      ${tickets.map((t) => ticketCard(t, site)).join("")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td align="center">
        <a href="${orderUrl}" style="display:inline-block;background:#1e1e1e;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:14px 24px;border-radius:99px">View ${many ? "tickets" : "ticket"} online</a>
        &nbsp;
        <a href="${calendarUrl()}" style="display:inline-block;color:#1e1e1e;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:14px 12px">Add to calendar</a>
      </td></tr></table>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#777;text-align:center;padding-bottom:16px">
        Order ${esc(order.reference)} · Hosted by Google Developer Groups Jos
      </div>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Dev fallback: write the email to disk so it can be previewed.
    try {
      const dir = path.join(process.cwd(), ".dev-emails");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `${Date.now()}-${to.replace(/[^a-z0-9]/gi, "_")}.html`);
      await writeFile(file, html);
      console.info(`[email] RESEND_API_KEY not set. Saved "${subject}" for ${to} to ${file}`);
    } catch {
      console.warn(`[email] RESEND_API_KEY not set and could not save preview for ${to}`);
    }
    return;
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "DevFest Jos <tickets@devfestjos.com>",
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * The buyer gets every ticket in the order; anyone else on the order gets
 * just their own ticket.
 */
export async function sendTicketEmails(order: Order, tickets: Ticket[], site: string) {
  const buyer = order.buyer_email.toLowerCase();
  const jobs = [send(buyer, tickets.length > 1 ? "Your DevFest Jos 2026 tickets" : "Your DevFest Jos 2026 ticket", render(order, tickets, order.buyer_name, site))];
  for (const t of tickets) {
    if (t.holder_email.toLowerCase() === buyer) continue;
    jobs.push(send(t.holder_email, "Your DevFest Jos 2026 ticket", render(order, [t], t.holder_name, site)));
  }
  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r) => console.error("[email]", (r as PromiseRejectedResult).reason));
  return failed.length === 0;
}

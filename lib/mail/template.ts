// Branded HTML for admin-composed emails. Pure (no server imports) so the
// composer can render the exact same HTML for its live preview.

export type Message = {
  subject: string;
  /** Big line in the dark header. Falls back to the subject. */
  headline?: string;
  /** Plain text with a little markdown: **bold**, [text](https://…), "- " lists, blank line = new paragraph. */
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type Recipient = { email: string; name: string | null };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const firstName = (name: string | null | undefined) => name?.trim().split(/\s+/)[0] || "there";

/** Replace {{first_name}} / {{name}} for one recipient. */
export function personalise(text: string, r: Recipient) {
  return text
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName(r.name))
    .replace(/\{\{\s*name\s*\}\}/gi, r.name?.trim() || "there");
}

export const safeUrl = (u: string | undefined) => (u && /^(https?:\/\/|mailto:)/i.test(u.trim()) ? u.trim() : null);

const link = "color:#1a73e8;text-decoration:underline";

function inline(raw: string) {
  const held: string[] = [];
  const hold = (html: string) => `\u0000${held.push(html) - 1}\u0000`;
  let s = raw.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text: string, url: string) =>
    safeUrl(url) ? hold(`<a href="${esc(url)}" style="${link}">${esc(text)}</a>`) : m,
  );
  s = s.replace(/\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => hold(`<a href="${esc(url)}" style="${link}">${esc(url)}</a>`));
  s = esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => held[Number(i)]);
}

const para = "margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2b2b2b";

export function bodyHtml(body: string) {
  return body
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        const items = lines.map((l) => `<li style="margin:0 0 6px">${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("");
        return `<ul style="${para};padding-left:20px">${items}</ul>`;
      }
      return `<p style="${para}">${lines.map(inline).join("<br>")}</p>`;
    })
    .join("");
}

/** Full email HTML for one recipient. */
export function renderMessage(msg: Message, r: Recipient, footer = "You're receiving this because you have a DevFest Jos 2026 ticket.") {
  const headline = personalise(msg.headline?.trim() || msg.subject, r);
  const cta = safeUrl(msg.ctaUrl) && msg.ctaLabel?.trim() ? { url: safeUrl(msg.ctaUrl)!, label: msg.ctaLabel.trim() } : null;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#f0f0f0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:24px 12px">
  <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="background:#1e1e1e;border-radius:24px 24px 0 0;padding:28px 28px 26px;font-family:Arial,Helvetica,sans-serif">
      <div style="font-size:20px;font-weight:bold;color:#ffffff"><span style="color:#4285f4">{</span> DevFest <span style="color:#f9ab00">}</span> <span style="font-size:11px;background:#fff;color:#1e1e1e;border-radius:99px;padding:2px 8px;vertical-align:middle">JOS '26</span></div>
      <div style="font-size:28px;line-height:1.15;font-weight:bold;color:#ffffff;margin-top:22px">${esc(headline)}</div>
    </td></tr>
    <tr><td style="background:#ffffff;padding:28px 28px 12px">
      ${bodyHtml(personalise(msg.body, r))}
      ${
        cta
          ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td>
        <a href="${esc(cta.url)}" style="display:inline-block;background:#1e1e1e;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;padding:14px 26px;border-radius:99px">${esc(cta.label)}</a>
      </td></tr></table>`
          : ""
      }
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:0 0 24px 24px;padding:0 28px 24px">
      <div style="border-top:1px solid #ececec;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a">
        ${esc(footer)}<br>Google Developer Groups Jos · DevFest Jos 2026
      </div>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

/** Plain-text alternative (helps deliverability). */
export function renderText(msg: Message, r: Recipient) {
  const body = personalise(msg.body, r)
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1 ($2)");
  const cta = safeUrl(msg.ctaUrl) && msg.ctaLabel?.trim() ? `\n\n${msg.ctaLabel.trim()}: ${safeUrl(msg.ctaUrl)}` : "";
  return `${body.trim()}${cta}\n\n—\nGoogle Developer Groups Jos · DevFest Jos 2026`;
}

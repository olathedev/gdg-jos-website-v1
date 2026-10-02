import { event } from "@/data/devfest26";

// Event hours in WAT (UTC+1). Doors 9am; end time assumed 5pm until confirmed.
const START_UTC = "20261017T080000Z";
const END_UTC = "20261017T160000Z";

/** Google Calendar "add event" link. */
export function calendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${START_UTC}/${END_UTC}`,
    details: "Your ticket QR code is in your email. See you there!",
    location: [event.venue, event.address, event.city].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

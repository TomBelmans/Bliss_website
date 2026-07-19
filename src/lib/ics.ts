import type { Booking } from "@/generated/prisma/client";

function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Vouwt regels langer dan 75 octets volgens RFC 5545 §3.1. */
function foldLine(line: string): string {
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes <= 75) return line;

  let result = "";
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const charBytes = Buffer.byteLength(char, "utf8");
    if (currentBytes + charBytes > 75) {
      result += (result ? "\r\n " : "") + current;
      current = char;
      currentBytes = charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  result += (result ? "\r\n " : "") + current;
  return result;
}

export function generateIcsFeed(bookings: Booking[]): string {
  const now = toIcsUtc(new Date());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bliss Beauty by Norah//Booking Calendar//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Bliss — Beauty by Norah afspraken",
    "REFRESH-INTERVAL;VALUE=DURATION:PT30M",
    "X-PUBLISHED-TTL:PT30M",
  ];

  for (const booking of bookings) {
    const description = [
      `Klant: ${booking.customerName}`,
      `E-mail: ${booking.customerEmail}`,
      booking.customerPhone ? `Telefoon: ${booking.customerPhone}` : null,
      booking.notes ? `Opmerkingen: ${booking.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${booking.id}@bliss-website`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcsUtc(booking.startsAt)}`,
      `DTEND:${toIcsUtc(booking.endsAt)}`,
      `SUMMARY:${escapeIcsText(`${booking.serviceName} — ${booking.customerName}`)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `STATUS:${booking.status === "CONFIRMED" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

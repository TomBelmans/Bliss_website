import { SALON_TIMEZONE } from "@/lib/timezone";

const eurFormatter = new Intl.NumberFormat("nl-BE", {
  style: "currency",
  currency: "EUR",
});

export function formatCents(cents: number): string {
  return eurFormatter.format(cents / 100);
}

const dateTimeFormatter = new Intl.DateTimeFormat("nl-BE", {
  timeZone: SALON_TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
  timeZone: SALON_TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const timeFormatter = new Intl.DateTimeFormat("nl-BE", {
  timeZone: SALON_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

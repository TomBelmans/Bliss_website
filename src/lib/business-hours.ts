import { zonedTimeToUtc } from "@/lib/timezone";

/** Interval tussen mogelijke starttijden. */
export const SLOT_STEP_MINUTES = 30;

/** Hoeveel dagen vooruit er geboekt kan worden. */
export const MAX_DAYS_AHEAD = 60;

/** Minimale voorlooptijd voor een boeking (voorkomt boekingen over 5 minuten). */
export const MIN_LEAD_MINUTES = 120;

/**
 * Elke behandeling wordt een kwartier langer ingepland dan de behandelduur
 * zelf, zodat er tussen twee klanten tijd is om op te ruimen en de kamer op
 * te frissen. Zit mee in `endsAt` van de boeking, dus ook de overlap-
 * constraint in de database houdt er rekening mee.
 */
export const BOOKING_BUFFER_MINUTES = 15;

export type BusyRange = { start: Date; end: Date };

/** Openingsuren voor één dag ("wandklok" HH:MM in SALON_TIMEZONE); null = gesloten. */
export type DayHours = { start: string; end: string } | null;

/**
 * Berekent alle geldige starttijden (als UTC Date) voor een dienst van
 * `durationMinutes` op `dateStr` (YYYY-MM-DD, in SALON_TIMEZONE), rekening
 * houdend met de werkuren van die dag (`hours`, uit de databank — zie
 * /admin/kalender), reeds bestaande boekingen, de opruim-buffer en de
 * minimale voorlooptijd.
 */
export function generateAvailableSlots(
  dateStr: string,
  durationMinutes: number,
  busyRanges: BusyRange[],
  hours: DayHours
): Date[] {
  if (!hours) return [];

  const blockMinutes = durationMinutes + BOOKING_BUFFER_MINUTES;
  const openAt = zonedTimeToUtc(dateStr, hours.start);
  const closeAt = zonedTimeToUtc(dateStr, hours.end);
  const earliestAllowed = new Date(Date.now() + MIN_LEAD_MINUTES * 60_000);

  const slots: Date[] = [];
  for (
    let start = new Date(openAt);
    start.getTime() + blockMinutes * 60_000 <= closeAt.getTime();
    start = new Date(start.getTime() + SLOT_STEP_MINUTES * 60_000)
  ) {
    const end = new Date(start.getTime() + blockMinutes * 60_000);
    if (start < earliestAllowed) continue;

    const overlaps = busyRanges.some((busy) => start < busy.end && end > busy.start);
    if (!overlaps) slots.push(new Date(start));
  }

  return slots;
}

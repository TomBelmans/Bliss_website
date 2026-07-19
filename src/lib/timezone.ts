export const SALON_TIMEZONE = "Europe/Brussels";

/**
 * Zet een "wandklok"-tijd (zoals de klant die ziet, in SALON_TIMEZONE) om
 * naar het overeenkomstige absolute UTC-tijdstip. Houdt automatisch
 * rekening met zomer-/wintertijd via de ICU-data van de Intl API, zonder
 * een extra tijdzone-library nodig te hebben.
 */
export function zonedTimeToUtc(dateStr: string, timeStr: string, timeZone = SALON_TIMEZONE): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const asZoned = new Date(utcGuess.toLocaleString("en-US", { timeZone }));
  const asUtc = new Date(utcGuess.toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = asUtc.getTime() - asZoned.getTime();

  return new Date(utcGuess.getTime() + offset);
}

/** De kalenderdatum (YYYY-MM-DD) van een absoluut UTC-tijdstip, gezien in SALON_TIMEZONE. */
export function utcToZonedDateStr(date: Date, timeZone = SALON_TIMEZONE): string {
  // en-CA formatteert als YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Minuten sinds middernacht ("wandklok" in SALON_TIMEZONE) van een UTC-tijdstip. */
export function zonedMinutesOfDay(date: Date, timeZone = SALON_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  // en-GB geeft om middernacht "24" terug in plaats van "00".
  return (hour % 24) * 60 + minute;
}

/** Dag van de week (0 = zondag ... 6 = zaterdag) van een datum in SALON_TIMEZONE. */
export function zonedDayOfWeek(dateStr: string): number {
  const noonUtc = zonedTimeToUtc(dateStr, "12:00");
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: SALON_TIMEZONE,
    weekday: "short",
  }).format(noonUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday];
}

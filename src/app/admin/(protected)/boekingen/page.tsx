/**
 * Pagina: /admin/boekingen
 * Doel: Weekkalender + gefilterde boekingenlijst; annuleren vanaf de lijst.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Booking.id, serviceName, customerName, customerEmail, customerPhone, startsAt, endsAt, status, notes — via `listBookings` / `listBookingsForCalendar`
 * - WorkingHours.weekday, enabled, startTime, endTime — via `listWorkingHours` (weekoverzicht)
 *
 * Acties / mutaties (via child components of forms):
 * - `cancelBooking` (DeleteButton in BookingList) → DAL `cancelBooking` — Booking.status → CANCELLED
 *
 * searchParams:
 * - `tijdvak` (`aankomend`|`verleden`|`alle`|`geannuleerd`) — BookingTimeframe voor de lijst
 * - `week` (YYYY-MM-DD) — bepaalt de maandag van het weekoverzicht
 * - `klant` — filtert op Booking.customerName (kalender + lijst)
 *
 * Lokale functies op deze pagina:
 * - `addDaysToDateStr` / `timeToMinutes` / `mondayOf`: datum-/tijdhelpers (geen fetch)
 * - `WeekOverview`: Booking + WorkingHours voor één week; bouwt WeekCalendar-dagen
 * - `BookingList`: Booking-lijst voor timeframe/klant; toont annuleren-knop
 */
import { Suspense } from "react";
import Link from "next/link";
import { listBookings, listBookingsForCalendar, listWorkingHours } from "@dal";
import type { BookingTimeframe } from "@models";
import { formatDateTime, formatTime } from "@/lib/format";
import { SALON_TIMEZONE, utcToZonedDateStr, zonedDayOfWeek, zonedMinutesOfDay, zonedTimeToUtc } from "@/lib/timezone";
import { bookingStatusLabels } from "@/lib/statusLabels";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { WeekCalendar, type CalendarDay } from "@/components/admin/WeekCalendar";
import { cancelBooking } from "@actions";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

export const metadata = { title: "Boekingen beheren" };

type Props = {
  searchParams: Promise<{ tijdvak?: string; week?: string; klant?: string }>;
};

const timeframeMap: Record<string, BookingTimeframe> = {
  aankomend: "upcoming",
  verleden: "past",
  alle: "all",
  geannuleerd: "cancelled",
};

/** Puur datum-rekenen op een YYYY-MM-DD string (geen tijdzones in het spel). */
function addDaysToDateStr(dateStr: string, delta: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + delta)).toISOString().slice(0, 10);
}

/** "09:30" → minuten sinds middernacht. */
function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

/** De maandag van de week waarin `dateStr` valt. */
function mondayOf(dateStr: string): string {
  const mondayOffset = (zonedDayOfWeek(dateStr) + 6) % 7;
  return addDaysToDateStr(dateStr, -mondayOffset);
}

export default async function AdminBoekingenPage({ searchParams }: Props) {
  const { tijdvak = "aankomend", week, klant = "" } = await searchParams;

  const todayStr = utcToZonedDateStr(new Date());
  const requestedStr = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : todayStr;
  const weekStart = mondayOf(requestedStr);
  // Wordt aan alle tab-/week-links geplakt zodat de filter behouden blijft.
  const klantParam = klant ? `&klant=${encodeURIComponent(klant)}` : "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Boekingen</h1>
        <Link
          href="/admin/boekingen/nieuw"
          className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
        >
          Nieuwe boeking
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-neutral-900">Weekoverzicht</h2>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/admin/boekingen?tijdvak=${tijdvak}&week=${addDaysToDateStr(weekStart, -7)}${klantParam}`}
            className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800 hover:bg-rose-100"
          >
            ← Vorige week
          </Link>
          <Link
            href={`/admin/boekingen?tijdvak=${tijdvak}${klantParam}`}
            className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800 hover:bg-rose-100"
          >
            Deze week
          </Link>
          <Link
            href={`/admin/boekingen?tijdvak=${tijdvak}&week=${addDaysToDateStr(weekStart, 7)}${klantParam}`}
            className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800 hover:bg-rose-100"
          >
            Volgende week →
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <Suspense key={`${weekStart}-${klant}`} fallback={<LoadingSpinner />}>
          <WeekOverview weekStart={weekStart} todayStr={todayStr} customerName={klant} />
        </Suspense>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm">
          {[
            { key: "aankomend", label: "Aankomend" },
            { key: "verleden", label: "Verleden" },
            { key: "alle", label: "Alle" },
            { key: "geannuleerd", label: "Geannuleerd" },
          ].map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/boekingen?tijdvak=${tab.key}&week=${weekStart}${klantParam}`}
              className={`rounded-full px-3 py-1.5 ${
                tijdvak === tab.key ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-800"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* GET-formulier: de filter zit in de URL en overleeft zo ook de tabs/week-navigatie. */}
        <form method="get" action="/admin/boekingen" className="flex items-center gap-2 text-sm">
          <input type="hidden" name="tijdvak" value={tijdvak} />
          <input type="hidden" name="week" value={weekStart} />
          <input
            type="search"
            name="klant"
            defaultValue={klant}
            placeholder="Filter op klantnaam..."
            className="w-56 rounded-full border border-neutral-300 px-4 py-1.5"
          />
          <button
            type="submit"
            className="rounded-full bg-rose-700 px-4 py-1.5 font-semibold text-white hover:bg-rose-800"
          >
            Zoek
          </button>
          {klant && (
            <Link
              href={`/admin/boekingen?tijdvak=${tijdvak}&week=${weekStart}`}
              className="text-neutral-500 underline hover:text-rose-700"
            >
              Wis filter
            </Link>
          )}
        </form>
      </div>

      {klant && (
        <p className="mt-3 text-sm text-neutral-600">
          Boekingen van klanten met &quot;<span className="font-medium">{klant}</span>&quot; in de naam:
        </p>
      )}

      <Suspense key={`${tijdvak}-${klant}`} fallback={<LoadingSpinner />}>
        <BookingList timeframe={timeframeMap[tijdvak] ?? "upcoming"} customerName={klant} />
      </Suspense>
    </div>
  );
}

/**
 * Haalt Bookings in het weekbereik (`listBookingsForCalendar`) en WorkingHours op;
 * filtert optioneel op klantnaam en bouwt de WeekCalendar-data.
 */
async function WeekOverview({
  weekStart,
  todayStr,
  customerName,
}: {
  weekStart: string;
  todayStr: string;
  customerName?: string;
}) {
  const weekEnd = addDaysToDateStr(weekStart, 7);
  const [allBookings, workingHours] = await Promise.all([
    listBookingsForCalendar(zonedTimeToUtc(weekStart, "00:00"), zonedTimeToUtc(weekEnd, "00:00")),
    listWorkingHours(),
  ]);

  const nameNeedle = customerName?.trim().toLowerCase();
  const bookings = nameNeedle
    ? allBookings.filter((b) => b.customerName.toLowerCase().includes(nameNeedle))
    : allBookings;

  const headingFormatter = new Intl.DateTimeFormat("nl-BE", {
    timeZone: SALON_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "numeric",
  });

  const days: CalendarDay[] = Array.from({ length: 7 }, (_, i) => {
    const dateStr = addDaysToDateStr(weekStart, i);
    const hours = workingHours.find((row) => row.weekday === zonedDayOfWeek(dateStr));

    return {
      dateStr,
      heading: headingFormatter.format(zonedTimeToUtc(dateStr, "12:00")),
      isToday: dateStr === todayStr,
      workStartMin: hours?.enabled ? timeToMinutes(hours.startTime) : null,
      workEndMin: hours?.enabled ? timeToMinutes(hours.endTime) : null,
      bookings: [],
    };
  });

  for (const booking of bookings) {
    const day = days.find((d) => d.dateStr === utcToZonedDateStr(booking.startsAt));
    if (!day) continue;

    const startMin = zonedMinutesOfDay(booking.startsAt);
    day.bookings.push({
      id: booking.id,
      serviceName: booking.serviceName,
      customerName: booking.customerName,
      startMin,
      // Clamp op middernacht zodat een blok nooit buiten zijn dagkolom loopt.
      endMin: Math.max(
        utcToZonedDateStr(booking.endsAt) === day.dateStr ? zonedMinutesOfDay(booking.endsAt) : 24 * 60,
        startMin + 15
      ),
      timeLabel: `${formatTime(booking.startsAt.toISOString())} – ${formatTime(booking.endsAt.toISOString())}`,
    });
  }

  // Toon van het vroegste tot het laatste relevante uur (werkuren én
  // eventuele boekingen erbuiten), afgerond op hele uren; standaard 09-17.
  let rangeStartMin = Number.POSITIVE_INFINITY;
  let rangeEndMin = Number.NEGATIVE_INFINITY;
  for (const day of days) {
    if (day.workStartMin !== null) rangeStartMin = Math.min(rangeStartMin, day.workStartMin);
    if (day.workEndMin !== null) rangeEndMin = Math.max(rangeEndMin, day.workEndMin);
    for (const booking of day.bookings) {
      rangeStartMin = Math.min(rangeStartMin, booking.startMin);
      rangeEndMin = Math.max(rangeEndMin, booking.endMin);
    }
  }
  if (!Number.isFinite(rangeStartMin) || !Number.isFinite(rangeEndMin)) {
    rangeStartMin = 9 * 60;
    rangeEndMin = 17 * 60;
  }
  rangeStartMin = Math.floor(rangeStartMin / 60) * 60;
  rangeEndMin = Math.ceil(rangeEndMin / 60) * 60;

  return <WeekCalendar days={days} rangeStartMin={rangeStartMin} rangeEndMin={rangeEndMin} />;
}

/** Haalt Bookings op via `listBookings(timeframe, customerName)` en toont de gefilterde lijst. */
async function BookingList({
  timeframe,
  customerName,
}: {
  timeframe: BookingTimeframe;
  customerName?: string;
}) {
  const bookings = await listBookings(timeframe, customerName);

  return (
    <div className="mt-6 divide-y divide-rose-100 rounded-lg border border-rose-100">
      {bookings.length === 0 && (
        <p className="p-4 text-sm text-neutral-500">
          {customerName?.trim()
            ? `Geen boekingen gevonden voor "${customerName.trim()}" in dit tijdvak.`
            : "Geen boekingen in dit tijdvak."}
        </p>
      )}
      {bookings.map((b) => (
        <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <Link href={`/admin/boekingen/${b.id}`} className="min-w-0 flex-1 hover:opacity-80">
            <p className="font-medium text-neutral-900">
              {b.serviceName}
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {bookingStatusLabels[b.status] ?? b.status}
              </span>
            </p>
            <p className="text-neutral-500">
              {b.customerName} &middot; {b.customerEmail}
              {b.customerPhone ? ` · ${b.customerPhone}` : ""}
            </p>
            <p className="text-neutral-500">{formatDateTime(b.startsAt.toISOString())}</p>
            {b.notes && <p className="mt-1 text-neutral-400">&quot;{b.notes}&quot;</p>}
          </Link>
          {b.status !== "CANCELLED" && (
            <DeleteButton
              action={cancelBooking.bind(null, { id: b.id })}
              confirmText={`Boeking van ${b.customerName} annuleren?`}
              label="Annuleren"
            />
          )}
        </div>
      ))}
    </div>
  );
}

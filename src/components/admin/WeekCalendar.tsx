import Link from "next/link";

export type CalendarBooking = {
  id: string;
  serviceName: string;
  customerName: string;
  /** Minuten sinds middernacht (wandklok in de salontijdzone). */
  startMin: number;
  endMin: number;
  /** Bv. "09:00 – 10:15". */
  timeLabel: string;
};

export type CalendarDay = {
  dateStr: string;
  /** Bv. "ma 20/7". */
  heading: string;
  isToday: boolean;
  /** Werkuren in minuten sinds middernacht; null = gesloten die dag. */
  workStartMin: number | null;
  workEndMin: number | null;
  bookings: CalendarBooking[];
};

/**
 * Puur presentational weekrooster (ma-zo): witte vlakken zijn werkuren,
 * grijze vlakken vallen buiten de ingestelde werktijd, roze blokken zijn
 * boekingen (behandelduur + opruim-buffer). 1 minuut = 1 pixel.
 * Klik op een blok opent de boeking-detailpagina.
 */
export function WeekCalendar({
  days,
  rangeStartMin,
  rangeEndMin,
}: {
  days: CalendarDay[];
  rangeStartMin: number;
  rangeEndMin: number;
}) {
  const height = rangeEndMin - rangeStartMin;

  const hourMarks: number[] = [];
  for (let h = Math.ceil(rangeStartMin / 60); h * 60 <= rangeEndMin; h++) {
    hourMarks.push(h);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-rose-100">
      <div className="min-w-[900px]">
        {/* Dagkoppen */}
        <div className="grid border-b border-rose-100" style={{ gridTemplateColumns: "3.5rem repeat(7, 1fr)" }}>
          <div />
          {days.map((day) => (
            <div
              key={day.dateStr}
              className={`border-l border-rose-100 px-2 py-2 text-center text-sm ${
                day.isToday ? "bg-rose-50 font-semibold text-rose-800" : "text-neutral-700"
              }`}
            >
              {day.heading}
            </div>
          ))}
        </div>

        {/* Rooster */}
        <div className="grid" style={{ gridTemplateColumns: "3.5rem repeat(7, 1fr)" }}>
          {/* Tijd-as */}
          <div className="relative" style={{ height }}>
            {hourMarks.map((h) => (
              <span
                key={h}
                className="absolute right-1.5 -translate-y-1/2 text-xs text-neutral-400"
                style={{ top: h * 60 - rangeStartMin }}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((day) => (
            <div
              key={day.dateStr}
              className="relative border-l border-rose-100 bg-neutral-100/80"
              style={{ height }}
            >
              {/* Werkuren (wit vlak) */}
              {day.workStartMin !== null && day.workEndMin !== null && (
                <div
                  className={`absolute inset-x-0 ${day.isToday ? "bg-rose-50/60" : "bg-white"}`}
                  style={{
                    top: day.workStartMin - rangeStartMin,
                    height: day.workEndMin - day.workStartMin,
                  }}
                />
              )}

              {/* Uurlijnen */}
              {hourMarks.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-neutral-200/80"
                  style={{ top: h * 60 - rangeStartMin }}
                />
              ))}

              {/* Boekingen */}
              {day.bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/boekingen/${booking.id}`}
                  title={`${booking.timeLabel} · ${booking.serviceName} · ${booking.customerName} (incl. opruimtijd)`}
                  className="absolute inset-x-1 z-10 overflow-hidden rounded-md bg-rose-700/90 p-1 text-xs leading-tight text-white shadow-sm transition hover:bg-rose-800 hover:ring-2 hover:ring-rose-300"
                  style={{
                    top: booking.startMin - rangeStartMin,
                    height: Math.max(booking.endMin - booking.startMin, 24),
                  }}
                >
                  <p className="truncate font-semibold">{booking.timeLabel}</p>
                  <p className="truncate">{booking.serviceName}</p>
                  <p className="truncate text-rose-100">{booking.customerName}</p>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

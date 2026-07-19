/**
 * Pagina: /admin/kalender
 * Doel: Werkuren (openingsdagen/-tijden) beheren voor beschikbaarheid.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - WorkingHours.weekday, enabled, startTime, endTime — via `listWorkingHours`
 *
 * Acties / mutaties (via child components of forms):
 * - `saveWorkingHours` (WorkingHoursForm) → DAL `upsertWorkingHours` — WorkingHours per weekdag
 *
 * Lokale functies op deze pagina:
 * - geen (DAY_ORDER is een constante voor weergavevolgorde ma–zo)
 */
import { listWorkingHours } from "@dal";
import { BOOKING_BUFFER_MINUTES } from "@/lib/business-hours";
import { WorkingHoursForm, type WorkingHoursDayState } from "@/components/admin/WorkingHoursForm";

export const metadata = { title: "Kalender" };

export const dynamic = "force-dynamic";

/** Weergavevolgorde: maandag t.e.m. zondag (weekday 0 = zondag). */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function AdminKalenderPage() {
  const rows = await listWorkingHours();

  const days: WorkingHoursDayState[] = DAY_ORDER.map((weekday) => {
    const row = rows.find((r) => r.weekday === weekday);
    return {
      weekday,
      enabled: row?.enabled ?? false,
      startTime: row?.startTime ?? "09:00",
      endTime: row?.endTime ?? "17:00",
    };
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Kalender</h1>
      <p className="mt-2 text-neutral-600">
        Kies op welke dagen en tijdstippen je werkt. Klanten kunnen enkel binnen deze uren
        boeken. Elke behandeling wordt automatisch {BOOKING_BUFFER_MINUTES} minuten langer
        ingepland, zodat er tijd is om op te ruimen en de kamer op te frissen.
      </p>

      <WorkingHoursForm initialDays={days} />
    </div>
  );
}

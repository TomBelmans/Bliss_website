import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceById, getWorkingHoursForWeekday, listBusyRanges } from "@dal";
import { generateAvailableSlots, MAX_DAYS_AHEAD } from "@/lib/business-hours";
import { zonedDayOfWeek, zonedTimeToUtc } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige parameters." }, { status: 400 });
  }
  const { serviceId, date } = parsed.data;

  const maxDate = new Date(Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60_000);
  if (zonedTimeToUtc(date, "00:00") > maxDate) {
    return NextResponse.json({ slots: [] });
  }

  const service = await getServiceById(serviceId);
  if (!service || !service.active) {
    return NextResponse.json({ error: "Dienst niet gevonden." }, { status: 404 });
  }

  const dayStart = zonedTimeToUtc(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);

  const [bookings, hoursRow] = await Promise.all([
    listBusyRanges(dayStart, dayEnd),
    getWorkingHoursForWeekday(zonedDayOfWeek(date)),
  ]);
  const busyRanges = bookings.map((b) => ({ start: b.startsAt, end: b.endsAt }));
  const hours = hoursRow?.enabled ? { start: hoursRow.startTime, end: hoursRow.endTime } : null;

  const slots = generateAvailableSlots(date, service.durationMinutes, busyRanges, hours);

  return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
}

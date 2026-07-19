import { NextResponse } from "next/server";
import {
  getServiceById,
  getWorkingHoursForWeekday,
  getCustomerById,
  createBooking,
  BookingOverlapError,
} from "@dal";
import { createBookingSchema } from "@schemas";
import { getCustomerSession, getSession } from "@mediators";
import { registerCustomer, signInCustomer } from "@actions";
import { BOOKING_BUFFER_MINUTES } from "@/lib/business-hours";
import { utcToZonedDateStr, zonedDayOfWeek, zonedTimeToUtc } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const {
    serviceId,
    startsAt,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    account,
    customerId: requestedCustomerId,
  } = parsed.data;

  const service = await getServiceById(serviceId);
  if (!service || !service.active) {
    return NextResponse.json({ error: "Dienst niet gevonden." }, { status: 404 });
  }

  const startDate = new Date(startsAt);
  if (Number.isNaN(startDate.getTime()) || startDate.getTime() < Date.now()) {
    return NextResponse.json({ error: "Kies een tijdstip in de toekomst." }, { status: 400 });
  }
  // Het geboekte blok is behandelduur + opruim-buffer, zodat de volgende
  // klant nooit direct aansluitend kan boeken.
  const endDate = new Date(
    startDate.getTime() + (service.durationMinutes + BOOKING_BUFFER_MINUTES) * 60_000
  );

  // Valideer tegen de ingestelde werkuren (het hele blok, incl. buffer,
  // moet binnen de werkdag vallen) — vóór de accountafhandeling, zodat er
  // geen account aangemaakt wordt voor een boeking die toch niet kan.
  const dateStr = utcToZonedDateStr(startDate);
  const hoursRow = await getWorkingHoursForWeekday(zonedDayOfWeek(dateStr));
  if (!hoursRow?.enabled) {
    return NextResponse.json({ error: "Op deze dag is de salon gesloten." }, { status: 400 });
  }
  const openAt = zonedTimeToUtc(dateStr, hoursRow.startTime);
  const closeAt = zonedTimeToUtc(dateStr, hoursRow.endTime);
  if (startDate < openAt || endDate > closeAt) {
    return NextResponse.json(
      { error: "Dit tijdstip valt buiten de openingsuren." },
      { status: 400 }
    );
  }

  // Boeken vereist een account: een bestaande klant-sessie, of inloggen/
  // registreren tijdens het boeken. Enige uitzondering is een ingelogde
  // beheerder die een telefonische/walk-in boeking invoert — die heeft
  // geen klantaccount en `customerId` blijft dan leeg, tenzij de beheerder
  // expliciet een bestaande klant selecteerde (`requestedCustomerId`).
  const existingSession = await getCustomerSession();
  let customerId: string | undefined = existingSession?.customer.id;

  if (requestedCustomerId) {
    const adminSession = await getSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: "Alleen de beheerder kan een boeking aan een bestaande klant koppelen." },
        { status: 403 }
      );
    }
    const customer = await getCustomerById(requestedCustomerId);
    if (!customer) {
      return NextResponse.json({ error: "Klant niet gevonden." }, { status: 400 });
    }
    customerId = customer.id;
  } else if (!existingSession) {
    if (account?.mode === "login") {
      const result = await signInCustomer(customerEmail, account.password);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      customerId = result.profile.id;
    } else if (account?.mode === "register") {
      const result = await registerCustomer({
        email: customerEmail,
        password: account.password,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone || undefined,
        street: account.street,
        houseNumber: account.houseNumber,
        postalCode: account.postalCode,
        city: account.city,
        country: account.country,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      customerId = result.profile.id;
    } else {
      const adminSession = await getSession();
      if (!adminSession) {
        return NextResponse.json(
          { error: "Log in of maak een account aan om te boeken." },
          { status: 401 }
        );
      }
    }
  }

  try {
    const booking = await createBooking({
      serviceId: service.id,
      serviceName: service.name,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      notes: notes || null,
      startsAt: startDate,
      endsAt: endDate,
      customerId,
    });
    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof BookingOverlapError) {
      return NextResponse.json(
        { error: "Dit tijdstip is net ingenomen. Kies een andere tijd." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Boeking kon niet aangemaakt worden." }, { status: 500 });
  }
}

/**
 * Data Access Layer voor boekingen (`Booking`).
 * Aangeroepen door: API-routes (`/api/bookings`, `/api/availability`,
 * `/api/calendar`), admin-pagina's (boekingen/dashboard) en account-pagina;
 * statuswijzigingen via server actions.
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { Booking, BookingStatus } from "@/generated/prisma/client";
import type { CreateBookingParams, BookingTimeframe } from "@models";

/** Wordt gegooid wanneer de `bookings_no_overlap` exclusion constraint in de database afslaat. */
export class BookingOverlapError extends Error {
  constructor() {
    super("Dit tijdstip is net ingenomen.");
    this.name = "BookingOverlapError";
  }
}

/**
 * Maakt een bevestigde boeking aan. De `bookings_no_overlap` exclusion
 * constraint in de database (zie prisma/migrations) garandeert dat er geen
 * dubbele boekingen ontstaan, zelfs bij gelijktijdige aanvragen — deze
 * functie gooit een `BookingOverlapError` als dat gebeurt.
 */
export async function createBooking(data: CreateBookingParams): Promise<Booking> {
  try {
    return await prismaClient.booking.create({
      data: { ...data, status: "CONFIRMED" },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("bookings_no_overlap")) {
      throw new BookingOverlapError();
    }
    throw error;
  }
}

/** Alle niet-geannuleerde boekingen die overlappen met [from, to), zonder klantgegevens. */
export async function listBusyRanges(
  from: Date,
  to: Date
): Promise<Array<{ startsAt: Date; endsAt: Date }>> {
  return prismaClient.booking.findMany({
    where: {
      status: { not: "CANCELLED" },
      startsAt: { lt: to },
      endsAt: { gt: from },
    },
    select: { startsAt: true, endsAt: true },
  });
}

/** Alle niet-geannuleerde boekingen in [from, to), inclusief klantgegevens (voor de ICS-feed). */
export async function listBookingsForCalendar(from: Date, to: Date): Promise<Booking[]> {
  return prismaClient.booking.findMany({
    where: {
      status: { not: "CANCELLED" },
      startsAt: { gte: from, lte: to },
    },
    orderBy: { startsAt: "asc" },
  });
}

/**
 * Filtert boekingen op timeframe (upcoming/past/cancelled/all) en optioneel
 * klantnaam. Model: `Booking`. Aangeroepen door admin-boekingenlijst en dashboard.
 */
export async function listBookings(
  timeframe: BookingTimeframe,
  customerName?: string
): Promise<Booking[]> {
  const now = new Date();
  const nameFilter = customerName?.trim()
    ? { customerName: { contains: customerName.trim(), mode: "insensitive" as const } }
    : {};

  if (timeframe === "cancelled") {
    return prismaClient.booking.findMany({
      where: { status: "CANCELLED", ...nameFilter },
      orderBy: { startsAt: "desc" },
    });
  }

  // Aankomend / verleden / alle: actieve boekingen (niet geannuleerd).
  const active = { status: { not: "CANCELLED" as const }, ...nameFilter };

  if (timeframe === "upcoming") {
    return prismaClient.booking.findMany({
      where: { ...active, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
    });
  }
  if (timeframe === "past") {
    return prismaClient.booking.findMany({
      where: { ...active, startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
    });
  }
  return prismaClient.booking.findMany({
    where: active,
    orderBy: { startsAt: "desc" },
  });
}

/**
 * Zet de status van een boeking (bv. CANCELLED). Model: `Booking`.
 * Aangeroepen door `cancelBooking` / `cancelOwnBooking` actions.
 */
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  return prismaClient.booking.update({ where: { id }, data: { status } });
}

/**
 * Haalt één boeking op via id. Model: `Booking`.
 * Aangeroepen door admin detailpagina en `cancelOwnBooking`.
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  return prismaClient.booking.findUnique({ where: { id } });
}

/**
 * Alle boekingen van een klantaccount, nieuwste eerst. Model: `Booking`.
 * Aangeroepen door `/account`.
 */
export async function listBookingsByCustomerId(customerId: string): Promise<Booking[]> {
  return prismaClient.booking.findMany({
    where: { customerId },
    orderBy: { startsAt: "desc" },
  });
}

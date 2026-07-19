/**
 * Data Access Layer voor klanten (`Customer`, `CustomerSession`,
 * `CustomerHistory`) en gastaggregaten uit `Booking`/`Order`.
 * Aangeroepen door: account/admin-pagina's, customer actions, mediators
 * (sessie) en API-flows die registreren/inloggen.
 */
import "server-only";
import { randomBytes } from "crypto";
import { cache } from "react";
import prismaClient from "./prismaClient";
import { hashPassword, verifyPassword } from "@serverUtils";
import { CUSTOMER_SESSION_DURATION_MS } from "@/lib/constants";
import type { Customer, CustomerSession } from "@/generated/prisma/client";
import type {
  CustomerAdminDetail,
  CustomerGeoStats,
  CustomerProfile,
  CustomerSessionWithProfile,
  GuestCustomer,
  GuestCustomerDetail,
  UpdateCustomerProfileParams,
} from "@models";

function toCustomerProfile(customer: Customer): CustomerProfile {
  const { password: _password, ...profile } = customer;
  return profile;
}

export type CreateCustomerParams = Pick<
  Customer,
  | "email"
  | "firstName"
  | "lastName"
  | "phone"
  | "street"
  | "houseNumber"
  | "postalCode"
  | "city"
  | "country"
> & { plainTextPassword: string };

/**
 * Maakt een klantaccount aan (wachtwoord gehashed). Model: `Customer`.
 * Aangeroepen door `registerCustomer` action.
 */
export async function createCustomer(data: CreateCustomerParams): Promise<CustomerProfile> {
  const { plainTextPassword, ...rest } = data;
  const customer = await prismaClient.customer.create({
    data: {
      ...rest,
      password: hashPassword(plainTextPassword),
    },
  });
  return toCustomerProfile(customer);
}

/** Zoekt klant op e-mail (inclusief wachtwoordhash). Model: `Customer`. */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  return prismaClient.customer.findUnique({ where: { email } });
}

/** Actieve (niet-verwijderde) klanten, alfabetisch — voor admin-selectie en lijsten. */
export async function listCustomers(): Promise<CustomerProfile[]> {
  const customers = await prismaClient.customer.findMany({
    where: { deletedAt: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return customers.map(toCustomerProfile);
}

/** Ruwe klantrij op id. Model: `Customer`. */
export async function getCustomerById(id: string): Promise<Customer | null> {
  return prismaClient.customer.findUnique({ where: { id } });
}

/** Publiek profiel zonder wachtwoord. Model: `Customer`. */
export async function getCustomerProfileById(id: string): Promise<CustomerProfile | null> {
  const customer = await getCustomerById(id);
  return customer ? toCustomerProfile(customer) : null;
}

/** Aantal geregistreerde klanten per land en per stad (alfabetisch op label). */
export async function getCustomerGeoStats(): Promise<CustomerGeoStats> {
  const [byCountryRows, byCityRows] = await Promise.all([
    prismaClient.customer.groupBy({
      by: ["country"],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { country: "asc" },
    }),
    prismaClient.customer.groupBy({
      by: ["city"],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { city: "asc" },
    }),
  ]);

  return {
    byCountry: byCountryRows
      .map((row) => ({ label: row.country, count: row._count._all }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "nl")),
    byCity: byCityRows
      .map((row) => ({ label: row.city, count: row._count._all }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "nl")),
  };
}

/**
 * Admin-detailaggregaten: behandelingen (verleden/gepland, niet geannuleerd),
 * betaalde/verzonden bestellingen en totale besteding.
 */
export async function getCustomerAdminDetail(id: string): Promise<CustomerAdminDetail | null> {
  const profile = await getCustomerProfileById(id);
  if (!profile) return null;

  const now = new Date();
  const activeBooking = { customerId: id, status: { not: "CANCELLED" as const } };

  const [treatmentsDone, treatmentsPlanned, orderStats] = await Promise.all([
    prismaClient.booking.count({
      where: { ...activeBooking, startsAt: { lt: now } },
    }),
    prismaClient.booking.count({
      where: { ...activeBooking, startsAt: { gte: now } },
    }),
    prismaClient.order.aggregate({
      where: { customerId: id, status: { in: ["PAID", "FULFILLED"] } },
      _count: { _all: true },
      _sum: { totalCents: true },
    }),
  ]);

  return {
    profile,
    treatmentsDone,
    treatmentsPlanned,
    orderCount: orderStats._count._all,
    totalSpentCents: orderStats._sum.totalCents ?? 0,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Unieke gastklanten: boekingen/bestellingen zonder `customerId`, gegroepeerd op e-mail.
 */
export async function listGuestCustomers(): Promise<GuestCustomer[]> {
  const [bookings, orders] = await Promise.all([
    prismaClient.booking.findMany({
      where: { customerId: null },
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        startsAt: true,
        createdAt: true,
      },
      orderBy: { startsAt: "desc" },
    }),
    prismaClient.order.findMany({
      where: { customerId: null },
      select: {
        customerEmail: true,
        customerName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const byEmail = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string | null;
      bookingCount: number;
      orderCount: number;
      lastActivityAt: Date;
    }
  >();

  for (const booking of bookings) {
    const key = normalizeEmail(booking.customerEmail);
    if (!key) continue;
    const activity = booking.startsAt > booking.createdAt ? booking.startsAt : booking.createdAt;
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, {
        email: booking.customerEmail.trim(),
        name: booking.customerName.trim(),
        phone: booking.customerPhone?.trim() || null,
        bookingCount: 1,
        orderCount: 0,
        lastActivityAt: activity,
      });
      continue;
    }
    existing.bookingCount += 1;
    if (activity > existing.lastActivityAt) existing.lastActivityAt = activity;
    if (!existing.phone && booking.customerPhone?.trim()) {
      existing.phone = booking.customerPhone.trim();
    }
  }

  for (const order of orders) {
    const key = normalizeEmail(order.customerEmail);
    if (!key) continue;
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, {
        email: order.customerEmail.trim(),
        name: order.customerName.trim(),
        phone: null,
        bookingCount: 0,
        orderCount: 1,
        lastActivityAt: order.createdAt,
      });
      continue;
    }
    existing.orderCount += 1;
    if (order.createdAt > existing.lastActivityAt) existing.lastActivityAt = order.createdAt;
  }

  return [...byEmail.values()].sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime() || a.name.localeCompare(b.name, "nl")
  );
}

/**
 * Gastklant-detail: boekingen/orders zonder `customerId` voor dit e-mailadres.
 * Models: `Booking`, `Order`. Aangeroepen door admin gast-detailpagina.
 */
export async function getGuestCustomerDetail(email: string): Promise<GuestCustomerDetail | null> {
  const needle = normalizeEmail(email);
  if (!needle) return null;

  const [bookings, orders] = await Promise.all([
    prismaClient.booking.findMany({
      where: { customerId: null, customerEmail: { equals: needle, mode: "insensitive" } },
      orderBy: { startsAt: "desc" },
    }),
    prismaClient.order.findMany({
      where: { customerId: null, customerEmail: { equals: needle, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (bookings.length === 0 && orders.length === 0) return null;

  const latestBooking = bookings[0];
  const latestOrder = orders[0];
  const name =
    latestBooking?.customerName.trim() ||
    latestOrder?.customerName.trim() ||
    needle;
  const phone = bookings.find((b) => b.customerPhone?.trim())?.customerPhone?.trim() || null;
  const lastActivityAt = [
    ...bookings.map((b) => (b.startsAt > b.createdAt ? b.startsAt : b.createdAt)),
    ...orders.map((o) => o.createdAt),
  ].reduce((max, d) => (d > max ? d : max));

  return {
    email: latestBooking?.customerEmail.trim() || latestOrder?.customerEmail.trim() || email.trim(),
    name,
    phone,
    bookingCount: bookings.length,
    orderCount: orders.length,
    lastActivityAt,
    bookings: bookings.map((b) => ({
      id: b.id,
      serviceName: b.serviceName,
      startsAt: b.startsAt,
      status: b.status,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      totalCents: o.totalCents,
      createdAt: o.createdAt,
      status: o.status,
    })),
  };
}

/**
 * Koppelt alle gastboekingen/-bestellingen met dit e-mailadres aan een bestaande
 * klant. De klant is leidend: naam, e-mail en telefoon op de rijen worden
 * overschreven met de klantgegevens.
 */
export async function linkGuestToCustomer(guestEmail: string, customerId: string): Promise<void> {
  const customer = await getCustomerById(customerId);
  if (!customer || customer.deletedAt) {
    throw new Error("Klant niet gevonden.");
  }

  const needle = normalizeEmail(guestEmail);
  const customerName = `${customer.firstName} ${customer.lastName}`.trim();

  await prismaClient.$transaction([
    prismaClient.booking.updateMany({
      where: { customerId: null, customerEmail: { equals: needle, mode: "insensitive" } },
      data: {
        customerId: customer.id,
        customerName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
    }),
    prismaClient.order.updateMany({
      where: { customerId: null, customerEmail: { equals: needle, mode: "insensitive" } },
      data: {
        customerId: customer.id,
        customerName,
        customerEmail: customer.email,
      },
    }),
  ]);
}

/**
 * Valideert e-mail/wachtwoord en start bij succes een nieuwe klantsessie.
 * Geeft `null` terug bij een ongeldige combinatie of verwijderd account.
 */
export async function signInCustomer(
  email: string,
  plainTextPassword: string
): Promise<{ profile: CustomerProfile; session: CustomerSession } | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer || customer.deletedAt) return null;
  if (!verifyPassword(plainTextPassword, customer.password)) return null;

  const session = await startCustomerSession(customer.id);
  return { profile: toCustomerProfile(customer), session };
}

/**
 * Start een nieuwe klantsessie met vaste TTL. Model: `CustomerSession`.
 * Aangeroepen door `signInCustomer` / `registerCustomer`.
 */
export async function startCustomerSession(customerId: string): Promise<CustomerSession> {
  const id = randomBytes(32).toString("hex");
  return prismaClient.customerSession.create({
    data: {
      id,
      customerId,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + CUSTOMER_SESSION_DURATION_MS),
    },
  });
}

/**
 * Haalt de sessie + bijhorende (publieke) klant op, enkel als de sessie nog
 * niet verlopen is. `cache()` dedupliceert herhaalde aanroepen binnen
 * dezelfde server-render pass.
 */
export const getCustomerSessionProfile = cache(
  async (sessionId: string): Promise<CustomerSessionWithProfile | null> => {
    const session = await prismaClient.customerSession.findUnique({
      where: { id: sessionId, activeUntil: { gt: new Date() } },
      include: { customer: true },
    });
    if (!session || session.customer.deletedAt) return null;

    const { customer, ...sessionFields } = session;
    return { ...sessionFields, customer: toCustomerProfile(customer) };
  }
);

/**
 * Verlengt de sessie-TTL. Model: `CustomerSession`.
 * Aangeroepen door customer-session mediator.
 */
export async function extendCustomerSession(id: string): Promise<CustomerSession> {
  return prismaClient.customerSession.update({
    where: { id },
    data: { activeUntil: new Date(Date.now() + CUSTOMER_SESSION_DURATION_MS) },
  });
}

/**
 * Verwijdert een klantsessie (uitloggen). Model: `CustomerSession`.
 * Aangeroepen door `signOutCustomer`.
 */
export async function stopCustomerSession(id: string): Promise<void> {
  await prismaClient.customerSession.delete({ where: { id } }).catch(() => {
    // Sessie bestond al niet meer (bv. dubbel uitloggen): niets te doen.
  });
}

function profileFieldsEqual(customer: Customer, next: UpdateCustomerProfileParams): boolean {
  return (
    customer.email === next.email &&
    customer.firstName === next.firstName &&
    customer.lastName === next.lastName &&
    (customer.phone ?? null) === (next.phone ?? null) &&
    customer.street === next.street &&
    customer.houseNumber === next.houseNumber &&
    customer.postalCode === next.postalCode &&
    customer.city === next.city &&
    customer.country === next.country
  );
}

/**
 * SCD2-profielupdate: archiveert de huidige status in `CustomerHistory` en
 * schrijft de nieuwe geldende waarden op `Customer`.
 */
export async function updateCustomerProfile(
  customerId: string,
  data: UpdateCustomerProfileParams
): Promise<CustomerProfile> {
  const customer = await getCustomerById(customerId);
  if (!customer || customer.deletedAt) {
    throw new Error("Account niet gevonden.");
  }

  if (profileFieldsEqual(customer, data)) {
    return toCustomerProfile(customer);
  }

  if (data.email !== customer.email) {
    const existing = await getCustomerByEmail(data.email);
    if (existing && existing.id !== customerId) {
      throw new Error("Er bestaat al een account met dit e-mailadres.");
    }
  }

  const now = new Date();

  const updated = await prismaClient.$transaction(async (tx) => {
    await tx.customerHistory.create({
      data: {
        customerId: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        street: customer.street,
        houseNumber: customer.houseNumber,
        postalCode: customer.postalCode,
        city: customer.city,
        country: customer.country,
        validFrom: customer.updatedAt,
        validTo: now,
      },
    });

    return tx.customer.update({
      where: { id: customerId },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        street: data.street,
        houseNumber: data.houseNumber,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
      },
    });
  });

  return toCustomerProfile(updated);
}

/**
 * GDPR soft-delete: account blijft bestaan (FK's/boekhouding), PII wordt
 * geanonimiseerd, sessies en SCD2-historiek met persoonsgegevens worden
 * verwijderd. Boekingen/orders behouden hun denormaliseerde snapshots.
 */
export async function anonymizeCustomer(customerId: string): Promise<void> {
  const customer = await getCustomerById(customerId);
  if (!customer || customer.deletedAt) {
    throw new Error("Account niet gevonden.");
  }

  const now = new Date();
  const anonymousEmail = `verwijderd-${customer.id}@anonieme-klant.invalid`;

  await prismaClient.$transaction(async (tx) => {
    await tx.customerHistory.deleteMany({ where: { customerId } });
    await tx.customerSession.deleteMany({ where: { customerId } });
    await tx.customer.update({
      where: { id: customerId },
      data: {
        email: anonymousEmail,
        password: hashPassword(randomBytes(32).toString("hex")),
        firstName: "Verwijderde",
        lastName: "klant",
        phone: null,
        street: "—",
        houseNumber: "—",
        postalCode: "—",
        city: "—",
        country: "—",
        deletedAt: now,
      },
    });
  });
}


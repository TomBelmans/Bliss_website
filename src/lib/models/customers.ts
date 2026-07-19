/**
 * Publiek klantprofiel (zonder wachtwoord-hash).
 * Expliciet gedefinieerd (niet afgeleid van Prisma `Customer`), zodat client-
 * code en type-aware linting een stabiel type hebben — inclusief `phone`.
 */
export type CustomerProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/** Sessierecord zoals opgeslagen voor een ingelogde klant (zonder DB-client-import). */
export type CustomerSessionFields = {
  id: string;
  customerId: string;
  activeFrom: Date;
  activeUntil: Date;
};

/** Een klantsessie met de bijhorende (publieke) klant erin samengevoegd. */
export type CustomerSessionWithProfile = CustomerSessionFields & {
  customer: CustomerProfile;
};

/** Aantal klanten per label (land of stad) voor admin-analyse. */
export type CustomerGeoCount = {
  label: string;
  count: number;
};

export type CustomerGeoStats = {
  byCountry: CustomerGeoCount[];
  byCity: CustomerGeoCount[];
};

/** Admin-detail: profiel + boeking-/bestelaggregaten. */
export type CustomerAdminDetail = {
  profile: CustomerProfile;
  treatmentsDone: number;
  treatmentsPlanned: number;
  orderCount: number;
  totalSpentCents: number;
};

/**
 * Gastklant: boekingen/bestellingen zonder `customerId`, gegroepeerd op e-mail.
 * Naam/telefoon komen uit de meest recente gastboeking.
 */
export type GuestCustomer = {
  email: string;
  name: string;
  phone: string | null;
  bookingCount: number;
  orderCount: number;
  lastActivityAt: Date;
};

export type GuestCustomerDetail = GuestCustomer & {
  bookings: Array<{
    id: string;
    serviceName: string;
    startsAt: Date;
    status: string;
  }>;
  orders: Array<{
    id: string;
    totalCents: number;
    createdAt: Date;
    status: string;
  }>;
};

/** Profielvelden die de klant zelf mag wijzigen (SCD2 op de server). */
export type UpdateCustomerProfileParams = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

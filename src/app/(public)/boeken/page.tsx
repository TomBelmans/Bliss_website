import type { Metadata } from "next";
import { listActiveServices } from "@dal";
import { getCustomerProfile } from "@mediators";
import { BookingForm } from "@/components/BookingForm";

/**
 * Pagina: /boeken
 * Doel: Online afspraak boeken (dienst, datum, tijdstip) via `BookingForm`.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service.id, Service.name, Service.durationMinutes, Service.priceCents —
 *   via `listActiveServices` (doorgegeven aan BookingForm)
 * - CustomerProfile (o.a. firstName, lastName, email) of null —
 *   via mediator `getCustomerProfile`
 * - Optioneel queryparam `service` als `initialServiceId`
 *
 * Acties / mutaties (via child components of API):
 * - `BookingForm`: slots via GET `/api/availability`; optioneel
 *   `registerCustomer` / `signInCustomer`; boeking via POST `/api/bookings`
 *
 * Lokale functies op deze pagina:
 * - (geen)
 */
export const metadata: Metadata = {
  title: "Afspraak boeken",
  description: "Boek online een afspraak bij Bliss — Beauty by Norah.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ service?: string }>;
};

export default async function BoekenPage({ searchParams }: Props) {
  const { service: initialServiceId } = await searchParams;

  const [services, customerProfile] = await Promise.all([
    listActiveServices(),
    getCustomerProfile(),
  ]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">Afspraak boeken</h1>
      <p className="mt-2 text-neutral-600">
        Kies een dienst, datum en tijdstip. Je afspraak is meteen bevestigd.
      </p>

      <div className="mt-8">
        {services.length > 0 ? (
          <BookingForm
            services={services}
            initialServiceId={initialServiceId}
            customerProfile={customerProfile}
          />
        ) : (
          <p className="text-neutral-500">Er zijn momenteel geen diensten beschikbaar.</p>
        )}
      </div>
    </div>
  );
}

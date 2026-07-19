/**
 * Pagina: /admin/boekingen/nieuw
 * Doel: Handmatige boeking aanmaken (telefoon/walk-in) via BookingForm.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service (actief, incl. categorieën) — via `listActiveServices`
 * - Customer.id, firstName, lastName, email, phone — via `listCustomers` (klantkiezer)
 *
 * Acties / mutaties (via child components of forms):
 * - BookingForm → POST `/api/bookings` → DAL `createBooking` — Booking (+ optioneel Customer-auth)
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { listActiveServices, listCustomers } from "@dal";
import { BookingForm } from "@/components/BookingForm";

export const metadata = { title: "Nieuwe boeking" };

export default async function AdminNieuweBoekingPage() {
  const [services, customers] = await Promise.all([listActiveServices(), listCustomers()]);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Nieuwe boeking</h1>
      <p className="mt-2 text-neutral-600">
        Voor telefonische of walk-in afspraken. Gebruikt dezelfde beschikbaarheidscontrole
        als de publieke boekingspagina.
      </p>
      <div className="mt-8">
        {services.length > 0 ? (
          <BookingForm
            services={services}
            customerProfile={null}
            hideAccountOptions
            customers={customers.map((c) => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              phone: c.phone,
            }))}
          />
        ) : (
          <p className="text-neutral-500">Er zijn geen actieve diensten.</p>
        )}
      </div>
    </div>
  );
}

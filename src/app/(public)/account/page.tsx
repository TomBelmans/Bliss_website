import type { Metadata } from "next";
import Link from "next/link";
import { getCustomerProfile } from "@mediators";
import { listBookingsByCustomerId, listOrdersByCustomerId } from "@dal";
import { formatCents, formatDateTime } from "@/lib/format";
import { bookingStatusLabels, orderStatusLabels } from "@/lib/statusLabels";
import { AccountLoginForm } from "@/components/AccountLoginForm";
import { AccountProfileForm } from "@/components/AccountProfileForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { SignOutButton } from "@/components/SignOutButton";
import { CancelOwnBookingButton } from "@/components/CancelOwnBookingButton";

/**
 * Pagina: /account
 * Doel: Klantaccount — login of profiel, boekingen, bestellingen en account verwijderen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Customer.id (+ profielvelden: email, firstName, lastName, phone, street,
 *   houseNumber, postalCode, city, country) — via mediator `getCustomerProfile`
 * - Booking.id, Booking.serviceName, Booking.startsAt, Booking.status —
 *   via `listBookingsByCustomerId`
 * - Order.id, Order.totalCents, Order.createdAt, Order.status —
 *   via `listOrdersByCustomerId`
 *
 * Acties / mutaties (via child components of API):
 * - `AccountLoginForm`: `signInCustomer`
 * - `AccountProfileForm`: `updateOwnProfile`
 * - `SignOutButton`: `signOutCustomer`
 * - `CancelOwnBookingButton`: `cancelOwnBooking`
 * - `DeleteAccountButton`: `deleteOwnAccount`
 *
 * Lokale functies op deze pagina:
 * - (geen)
 */
export const metadata: Metadata = {
  title: "Mijn account",
  description: "Bekijk je gegevens, boekingen en bestellingen bij Bliss — Beauty by Norah.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const profile = await getCustomerProfile();

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-semibold text-neutral-900">Mijn account</h1>
        <p className="mt-2 text-neutral-600">
          Log in om je gegevens, boekingen en bestellingen te bekijken.
        </p>

        <div className="mt-8">
          <AccountLoginForm />
        </div>

        <p className="mt-6 text-sm text-neutral-500">
          Nog geen account? Je kan er meteen een aanmaken bij het{" "}
          <Link href="/boeken" className="text-rose-700 underline">
            boeken van een afspraak
          </Link>{" "}
          of het{" "}
          <Link href="/winkelwagen" className="text-rose-700 underline">
            afrekenen van je winkelwagen
          </Link>
          .
        </p>
      </div>
    );
  }

  const [bookings, orders] = await Promise.all([
    listBookingsByCustomerId(profile.id),
    listOrdersByCustomerId(profile.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-neutral-900">Mijn account</h1>
        <SignOutButton />
      </div>

      <section className="mt-8 rounded-2xl border border-rose-100 p-6">
        <h2 className="text-lg font-medium text-neutral-900">Mijn gegevens</h2>
        <AccountProfileForm profile={profile} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-neutral-900">Mijn boekingen</h2>
        {bookings.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Je hebt nog geen boekingen.</p>
        ) : (
          <div className="mt-4 divide-y divide-rose-100 border-y border-rose-100">
            {bookings.map((booking) => {
              const canCancel =
                booking.status !== "CANCELLED" && booking.startsAt.getTime() > Date.now();

              return (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{booking.serviceName}</p>
                    <p className="text-neutral-500">
                      {formatDateTime(booking.startsAt.toISOString())}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                      {bookingStatusLabels[booking.status] ?? booking.status}
                    </span>
                    {canCancel && (
                      <CancelOwnBookingButton
                        bookingId={booking.id}
                        serviceName={booking.serviceName}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-neutral-900">Mijn bestellingen</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Je hebt nog geen bestellingen.</p>
        ) : (
          <div className="mt-4 divide-y divide-rose-100 border-y border-rose-100">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">{formatCents(order.totalCents)}</p>
                  <p className="text-neutral-500">{formatDateTime(order.createdAt.toISOString())}</p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                  {orderStatusLabels[order.status] ?? order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h2 className="text-lg font-medium text-neutral-900">Account verwijderen</h2>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}

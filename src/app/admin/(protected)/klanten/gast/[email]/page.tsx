/**
 * Pagina: /admin/klanten/gast/[email]
 * Doel: Gastklant-detail (boekingen/orders zonder account) en koppelen aan Customer.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Gast: name, email, phone, bookingCount, orderCount + gerelateerde Booking/Order — via `getGuestCustomerDetail`
 * - Customer.id, firstName, lastName, email — via `listCustomers` (koppel-dropdown)
 *
 * Acties / mutaties (via child components of forms):
 * - `linkGuestToCustomer` (LinkGuestForm) → DAL `linkGuestToCustomer` — koppelt Booking/Order aan Customer
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuestCustomerDetail, listCustomers } from "@dal";
import { formatCents, formatDateTime } from "@/lib/format";
import { bookingStatusLabels, orderStatusLabels } from "@/lib/statusLabels";
import { LinkGuestForm } from "@/components/admin/LinkGuestForm";
import { StatCard } from "@/components/admin/StatCard";

export const metadata = { title: "Gastklant" };

export default async function AdminGastDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);
  const [guest, customers] = await Promise.all([
    getGuestCustomerDetail(email),
    listCustomers(),
  ]);

  if (!guest) notFound();

  return (
    <div>
      <Link href="/admin/klanten?type=gasten" className="text-sm text-rose-700 hover:underline">
        ← Terug naar gasten
      </Link>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{guest.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{guest.email}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          gast
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Boekingen" value={String(guest.bookingCount)} />
        <StatCard label="Bestellingen" value={String(guest.orderCount)} />
        <StatCard label="Telefoon" value={guest.phone || "—"} />
      </div>

      <section className="mt-8 rounded-lg border border-rose-100 bg-white p-5">
        <h2 className="text-lg font-medium text-neutral-900">Koppelen aan bestaande klant</h2>
        <p className="mt-1 text-sm text-neutral-500">
          De gekozen klant is leidend: diens naam, e-mail en telefoon worden overgenomen op alle
          gastboekingen en -bestellingen met dit e-mailadres.
        </p>
        <div className="mt-4">
          <LinkGuestForm
            guestEmail={guest.email}
            customers={customers.map((c) => ({
              id: c.id,
              label: `${c.firstName} ${c.lastName} (${c.email})`,
            }))}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium text-neutral-900">Behandelingen</h2>
          <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
            {guest.bookings.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">Geen boekingen.</li>
            )}
            {guest.bookings.map((booking) => (
              <li key={booking.id} className="p-4 text-sm">
                <Link href={`/admin/boekingen/${booking.id}`} className="hover:opacity-80">
                  <p className="font-medium text-neutral-900">{booking.serviceName}</p>
                  <p className="text-neutral-500">
                    {formatDateTime(booking.startsAt.toISOString())} &middot;{" "}
                    {bookingStatusLabels[booking.status] ?? booking.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-900">Bestellingen</h2>
          <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
            {guest.orders.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">Geen bestellingen.</li>
            )}
            {guest.orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">
                    {formatDateTime(order.createdAt.toISOString())}
                  </p>
                  <p className="text-neutral-500">
                    {orderStatusLabels[order.status] ?? order.status}
                  </p>
                </div>
                <Link
                  href={`/admin/bestellingen/${order.id}`}
                  className="shrink-0 font-medium text-rose-800 hover:underline"
                >
                  {formatCents(order.totalCents)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

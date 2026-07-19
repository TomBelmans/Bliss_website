/**
 * Pagina: /admin/klanten/[id]
 * Doel: Detail van een geregistreerde klant met stats, boekingen en bestellingen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Customer-profiel + treatmentsDone/Planned, orderCount, totalSpentCents — via `getCustomerAdminDetail`
 *   (Customer.firstName, lastName, email, phone, street, houseNumber, postalCode, city, country, createdAt, deletedAt)
 * - Booking.serviceName, startsAt, status — via `listBookingsByCustomerId`
 * - Order.createdAt, status, totalCents — via `listOrdersByCustomerId`
 *
 * Acties / mutaties (via child components of forms):
 * - geen (alleen weergave + links)
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCustomerAdminDetail,
  listBookingsByCustomerId,
  listOrdersByCustomerId,
} from "@dal";
import { formatCents, formatDateTime } from "@/lib/format";
import { bookingStatusLabels, orderStatusLabels } from "@/lib/statusLabels";
import { StatCard } from "@/components/admin/StatCard";
import { DetailRow } from "@/components/admin/DetailRow";

export const metadata = { title: "Klantdetail" };

export default async function AdminKlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCustomerAdminDetail(id);
  if (!detail) notFound();

  const { profile } = detail;
  const [bookings, orders] = await Promise.all([
    listBookingsByCustomerId(id),
    listOrdersByCustomerId(id),
  ]);

  return (
    <div>
      <Link href="/admin/klanten" className="text-sm text-rose-700 hover:underline">
        ← Terug naar klanten
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
        {profile.firstName} {profile.lastName}
        {profile.deletedAt && (
          <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
            geanonimiseerd
          </span>
        )}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">{profile.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Behandelingen gehad" value={String(detail.treatmentsDone)} />
        <StatCard label="Behandelingen gepland" value={String(detail.treatmentsPlanned)} />
        <StatCard label="Bestellingen" value={String(detail.orderCount)} />
        <StatCard label="Totaal gespendeerd" value={formatCents(detail.totalSpentCents)} />
      </div>

      <section className="mt-8 rounded-lg border border-rose-100 bg-white p-5">
        <h2 className="text-lg font-medium text-neutral-900">Gegevens</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <DetailRow term="Telefoon" value={profile.phone || "—"} />
          <DetailRow
            term="Adres"
            value={`${profile.street} ${profile.houseNumber}, ${profile.postalCode} ${profile.city}`}
          />
          <DetailRow term="Land" value={profile.country} />
          <DetailRow
            term="Lid sinds"
            value={profile.createdAt.toLocaleDateString("nl-BE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        </dl>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium text-neutral-900">Behandelingen</h2>
          <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
            {bookings.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">Nog geen boekingen gekoppeld.</li>
            )}
            {bookings.map((booking) => (
              <li key={booking.id} className="p-4 text-sm">
                <p className="font-medium text-neutral-900">{booking.serviceName}</p>
                <p className="text-neutral-500">
                  {formatDateTime(booking.startsAt.toISOString())} &middot;{" "}
                  {bookingStatusLabels[booking.status] ?? booking.status}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-900">Bestellingen</h2>
          <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
            {orders.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">Nog geen bestellingen gekoppeld.</li>
            )}
            {orders.map((order) => (
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

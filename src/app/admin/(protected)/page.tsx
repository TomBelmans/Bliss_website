/**
 * Pagina: /admin
 * Doel: Dashboard-overzicht met tellers en recente activiteit.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service (count actief) — via `listActiveServices`
 * - Product (count actief) — via `listActiveProducts`
 * - Booking.serviceName, customerName, startsAt — via `listBookings("upcoming")` (top 5)
 * - Order.customerName, status, totalCents — via `listOrders` (top 5)
 *
 * Acties / mutaties (via child components of forms):
 * - geen
 *
 * Lokale functies op deze pagina:
 * - `DashboardData`: haalt diensten/producten/boekingen/orders parallel op; toont stats + lijsten
 * - `StatCard`: UI-helper voor een tellerkaart (geen data-fetch)
 */
import { Suspense } from "react";
import { listActiveServices, listActiveProducts, listBookings, listOrders } from "@dal";
import { formatCents, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

export const metadata = { title: "Beheer overzicht" };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Overzicht</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}

/** Haalt actieve diensten/producten, aankomende boekingen en orders op voor het dashboard. */
async function DashboardData() {
  const [services, products, upcomingBookings, orders] = await Promise.all([
    listActiveServices(),
    listActiveProducts(),
    listBookings("upcoming"),
    listOrders(),
  ]);
  const recentOrders = orders.slice(0, 5);
  const nextBookings = upcomingBookings.slice(0, 5);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Actieve diensten" value={services.length} />
        <StatCard label="Actieve producten" value={products.length} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium text-neutral-900">Aankomende boekingen</h2>
          <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
            {nextBookings.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">Geen aankomende boekingen.</li>
            )}
            {nextBookings.map((b) => (
              <li key={b.id} className="p-4 text-sm">
                <p className="font-medium text-neutral-900">{b.serviceName}</p>
                <p className="text-neutral-500">
                  {b.customerName} &middot; {formatDateTime(b.startsAt.toISOString())}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium text-neutral-900">Recente bestellingen</h2>
          <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
            {recentOrders.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">Nog geen bestellingen.</li>
            )}
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">{o.customerName}</p>
                  <p className="text-neutral-500">{o.status}</p>
                </div>
                <span className="font-medium text-rose-800">{formatCents(o.totalCents)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-rose-100 p-4">
      <p className="text-2xl font-semibold text-rose-800">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
    </div>
  );
}

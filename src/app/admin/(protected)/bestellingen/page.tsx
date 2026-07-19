/**
 * Pagina: /admin/bestellingen
 * Doel: Overzicht van alle webshop-bestellingen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Order.customerName, customerEmail, status, totalCents, createdAt — via `listOrders`
 *
 * Acties / mutaties (via child components of forms):
 * - geen (status wijzigen op detailpagina)
 *
 * Lokale functies op deze pagina:
 * - `OrderList`: haalt alle Orders op via `listOrders` en toont de lijst
 */
import { Suspense } from "react";
import Link from "next/link";
import { listOrders } from "@dal";
import { formatCents, formatDateTime } from "@/lib/format";
import { orderStatusLabels } from "@/lib/statusLabels";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

export const metadata = { title: "Bestellingen beheren" };

export default function AdminBestellingenPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Bestellingen</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <OrderList />
      </Suspense>
    </div>
  );
}

/** Haalt alle Orders op via `listOrders` (nieuwste eerst) voor de admin-lijst. */
async function OrderList() {
  const orders = await listOrders();

  return (
    <div className="mt-6 divide-y divide-rose-100 rounded-lg border border-rose-100">
      {orders.length === 0 && (
        <p className="p-4 text-sm text-neutral-500">Nog geen bestellingen.</p>
      )}
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/bestellingen/${order.id}`}
          className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-rose-50"
        >
          <div>
            <p className="font-medium text-neutral-900">
              {order.customerName}
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {orderStatusLabels[order.status] ?? order.status}
              </span>
            </p>
            <p className="text-neutral-500">
              {order.customerEmail} &middot; {formatDateTime(order.createdAt.toISOString())}
            </p>
          </div>
          <span className="font-medium text-rose-800">{formatCents(order.totalCents)}</span>
        </Link>
      ))}
    </div>
  );
}

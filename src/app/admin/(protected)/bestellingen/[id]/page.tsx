/**
 * Pagina: /admin/bestellingen/[id]
 * Doel: Bestellingdetail met artikelen en statuswijziging.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Order.customerName, customerEmail, createdAt, totalCents, status — via `getOrderById`
 * - OrderItem.productName, quantity, unitPriceCents — via `getOrderItems`
 *
 * Acties / mutaties (via child components of forms):
 * - `updateOrderStatus` (OrderStatusForm) → DAL `updateOrderStatus` — Order.status
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { notFound } from "next/navigation";
import { getOrderById, getOrderItems } from "@dal";
import { formatCents, formatDateTime } from "@/lib/format";
import { updateOrderStatus } from "@actions";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const metadata = { title: "Bestelling" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BestellingDetailPage({ params }: Props) {
  const { id } = await params;

  const [order, items] = await Promise.all([getOrderById(id), getOrderItems(id)]);

  if (!order) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Bestelling</h1>

      <div className="mt-6 rounded-lg border border-rose-100 p-4 text-sm">
        <p className="font-medium text-neutral-900">{order.customerName}</p>
        <p className="text-neutral-500">{order.customerEmail}</p>
        <p className="mt-1 text-neutral-500">{formatDateTime(order.createdAt.toISOString())}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-neutral-900">Artikelen</h2>
        <div className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{item.productName}</p>
                <p className="text-neutral-500">
                  {item.quantity} &times; {formatCents(item.unitPriceCents)}
                </p>
              </div>
              <span className="font-medium text-neutral-900">
                {formatCents(item.unitPriceCents * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-sm">
          <span className="font-medium text-neutral-900">Totaal</span>
          <span className="font-semibold text-rose-800">{formatCents(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-8 border-t border-rose-100 pt-6">
        <label className="block text-sm font-medium text-neutral-700">Status</label>
        <OrderStatusForm currentStatus={order.status} action={updateOrderStatus.bind(null, order.id)} />
      </div>
    </div>
  );
}

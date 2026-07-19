/**
 * Data Access Layer voor bestellingen (`Order`, `OrderItem`).
 * Aangeroepen door: Stripe-webhook, admin bestellingen-pagina's, account-pagina
 * en `updateOrderStatus` action.
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { Order, OrderItem, OrderStatus } from "@/generated/prisma/client";
import type { CreateOrderParams } from "@models";

/**
 * Zoekt order via Stripe Checkout Session-id. Model: `Order`.
 * Aangeroepen door Stripe-webhook (idempotency).
 */
export async function getOrderByStripeSessionId(sessionId: string): Promise<Order | null> {
  return prismaClient.order.findUnique({ where: { stripeCheckoutSessionId: sessionId } });
}

/**
 * Maakt een betaalde order + orderregels in één transactie. Models: `Order`, `OrderItem`.
 * Aangeroepen door Stripe-webhook na succesvolle betaling.
 */
export async function createPaidOrder({ items, ...order }: CreateOrderParams): Promise<Order> {
  return prismaClient.order.create({
    data: {
      ...order,
      status: "PAID",
      items: { create: items },
    },
  });
}

/**
 * Alle orders, nieuwste eerst. Model: `Order`.
 * Aangeroepen door admin bestellingenlijst en dashboard.
 */
export async function listOrders(): Promise<Order[]> {
  return prismaClient.order.findMany({ orderBy: { createdAt: "desc" } });
}

/**
 * Orders van één klantaccount. Model: `Order`.
 * Aangeroepen door `/account`.
 */
export async function listOrdersByCustomerId(customerId: string): Promise<Order[]> {
  return prismaClient.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Één order op id. Model: `Order`.
 * Aangeroepen door admin order-detailpagina.
 */
export async function getOrderById(id: string): Promise<Order | null> {
  return prismaClient.order.findUnique({ where: { id } });
}

/**
 * Orderregels van een order. Model: `OrderItem`.
 * Aangeroepen door admin order-detailpagina.
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  return prismaClient.orderItem.findMany({ where: { orderId } });
}

/**
 * Wijzigt orderstatus (PAID/FULFILLED/…). Model: `Order`.
 * Aangeroepen door `updateOrderStatus` action.
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return prismaClient.order.update({ where: { id }, data: { status } });
}

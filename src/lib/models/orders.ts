import type { Order, OrderItem } from "@/generated/prisma/client";

export type CreateOrderItemParams = Pick<
  OrderItem,
  "productId" | "productName" | "unitPriceCents" | "quantity"
>;

export type CreateOrderParams = Pick<
  Order,
  | "customerName"
  | "customerEmail"
  | "totalCents"
  | "currency"
  | "stripeCheckoutSessionId"
  | "stripePaymentIntentId"
> &
  Partial<Pick<Order, "customerId">> & { items: CreateOrderItemParams[] };

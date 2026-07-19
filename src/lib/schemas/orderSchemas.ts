import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Winkelwagen is leeg."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderStatusSchema = z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getOrderByStripeSessionId, createPaidOrder, decrementStock } from "@dal";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Ontbrekende Stripe-signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret());
  } catch {
    return NextResponse.json({ error: "Ongeldige webhook-signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const sessionSummary = event.data.object;

  const existingOrder = await getOrderByStripeSessionId(sessionSummary.id);
  if (existingOrder) {
    return NextResponse.json({ received: true });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionSummary.id, {
    expand: ["line_items.data.price.product"],
  });

  const lineItems = session.line_items?.data ?? [];
  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Geen orderregels gevonden in Stripe-sessie." }, { status: 500 });
  }

  const items = lineItems.map((line) => {
    const product = line.price?.product;
    const productId =
      product && typeof product === "object" && "metadata" in product
        ? (product.metadata.product_id ?? null)
        : null;
    const productName =
      product && typeof product === "object" && "name" in product
        ? product.name
        : (line.description ?? "Product");

    return {
      productId,
      productName,
      unitPriceCents: line.price?.unit_amount ?? 0,
      quantity: line.quantity ?? 1,
    };
  });

  await createPaidOrder({
    customerName: session.customer_details?.name ?? "Onbekend",
    customerEmail: session.customer_details?.email ?? "",
    // customerId komt uit Stripe client_reference_id (gezet in /api/checkout
    // op basis van de klant-sessie). Nieuwe checkouts vereisen login; null
    // komt enkel nog voor bij oudere gastbestellingen.
    customerId: session.client_reference_id ?? null,
    totalCents: session.amount_total ?? 0,
    currency: session.currency ?? "eur",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    items,
  });

  for (const item of items) {
    if (item.productId) {
      await decrementStock(item.productId, item.quantity);
    }
  }

  return NextResponse.json({ received: true });
}

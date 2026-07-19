import { NextResponse } from "next/server";
import { getProductsByIds } from "@dal";
import { checkoutSchema } from "@schemas";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getCustomerSession } from "@mediators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Afrekenen vereist een account: de winkelwagen-pagina logt eerst in of
  // registreert (dat zet de sessie-cookie) vóór ze deze route aanroept.
  const customerSession = await getCustomerSession();
  if (!customerSession) {
    return NextResponse.json(
      { error: "Log in of maak een account aan om af te rekenen." },
      { status: 401 }
    );
  }

  const json: unknown = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige winkelwagen." }, { status: 400 });
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await getProductsByIds(productIds);

  const lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; metadata: { product_id: string } };
    };
    quantity: number;
  }> = [];

  for (const item of parsed.data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Eén van de producten is niet meer beschikbaar." },
        { status: 400 }
      );
    }
    if (product.stockQuantity < item.quantity) {
      return NextResponse.json(
        { error: `"${product.name}" heeft onvoldoende voorraad.` },
        { status: 400 }
      );
    }
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: product.priceCents,
        product_data: { name: product.name, metadata: { product_id: product.id } },
      },
      quantity: item.quantity,
    });
  }

  const siteUrl = env.siteUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/bestelling/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/bestelling/geannuleerd`,
    shipping_address_collection: {
      allowed_countries: ["BE", "NL", "LU", "FR", "DE"],
    },
    client_reference_id: customerSession.customer.id,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Kon geen betaalsessie aanmaken." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}

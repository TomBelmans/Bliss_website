import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";
import { formatCents } from "@/lib/format";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

/**
 * Pagina: /bestelling/succes
 * Doel: Bedankpagina na succesvolle Stripe-checkout; toont optioneel bedrag/e-mail.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - (geen DB; leest Stripe Checkout Session via `getStripe().checkout.sessions.retrieve`
 *   — `amount_total`, `customer_details.email` uit queryparam `session_id`)
 *
 * Acties / mutaties (via child components of API):
 * - `ClearCartOnMount`: wist de client-cart (localStorage) bij mount
 *
 * Lokale functies op deze pagina:
 * - (geen)
 */
export const metadata: Metadata = { title: "Bedankt voor je bestelling" };

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function BestellingSuccesPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  let amountTotal: number | null = null;
  let email: string | null = null;

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      amountTotal = session.amount_total;
      email = session.customer_details?.email ?? null;
    } catch {
      // Sessie niet gevonden of ongeldig: toon gewoon de generieke bedankpagina.
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <ClearCartOnMount />
      <h1 className="text-2xl font-semibold text-neutral-900">Bedankt voor je bestelling!</h1>
      <p className="mt-3 text-neutral-600">
        We hebben je betaling ontvangen{email ? ` en sturen een bevestiging naar ${email}` : ""}.
      </p>
      {amountTotal !== null && (
        <p className="mt-4 text-lg font-semibold text-rose-800">{formatCents(amountTotal)}</p>
      )}
      <Link
        href="/winkel"
        className="mt-8 inline-block rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
      >
        Verder winkelen
      </Link>
    </div>
  );
}

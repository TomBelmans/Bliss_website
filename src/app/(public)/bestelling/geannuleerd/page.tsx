import Link from "next/link";
import type { Metadata } from "next";

/**
 * Pagina: /bestelling/geannuleerd
 * Doel: Statische melding na geannuleerde Stripe-checkout, met link terug naar winkelwagen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - (geen DB; pure UI)
 *
 * Acties / mutaties (via child components of API):
 * - (geen; alleen navigatielink naar `/winkelwagen`)
 *
 * Lokale functies op deze pagina:
 * - (geen)
 */
export const metadata: Metadata = { title: "Bestelling geannuleerd" };

export default function BestellingGeannuleerdPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Bestelling geannuleerd</h1>
      <p className="mt-3 text-neutral-600">
        Er is niets afgeschreven. Je winkelwagen staat nog klaar als je verder wil bestellen.
      </p>
      <Link
        href="/winkelwagen"
        className="mt-8 inline-block rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
      >
        Terug naar winkelwagen
      </Link>
    </div>
  );
}

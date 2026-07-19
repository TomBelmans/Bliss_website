import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { listActiveServices } from "@dal";
import { formatCents } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

/**
 * Pagina: /diensten
 * Doel: Overzicht van alle actieve schoonheidsbehandelingen met boek-CTA.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service.id, Service.name, Service.description, Service.durationMinutes,
 *   Service.priceCents, Service.categories.id, Service.categories.name —
 *   via `listActiveServices`
 *
 * Acties / mutaties (via child components of API):
 * - (geen; “Boek nu” linkt naar `/boeken?service=…`)
 *
 * Lokale functies op deze pagina:
 * - `ServiceList`: rendert de dienstenlijst; leest Service (+categorieën) via DAL
 */
export const metadata: Metadata = {
  title: "Diensten",
  description: "Overzicht van alle schoonheidsbehandelingen bij Bliss — Beauty by Norah.",
};

export const dynamic = "force-dynamic";

export default function DienstenPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">Diensten</h1>
      <p className="mt-2 text-neutral-600">
        Kies de behandeling die bij je past en boek meteen online.
      </p>

      <Suspense fallback={<LoadingSpinner />}>
        <ServiceList />
      </Suspense>
    </div>
  );
}

/** Volledige lijst actieve diensten met categorieën, prijs en boek-link. */
async function ServiceList() {
  const services = await listActiveServices();

  return (
    <div className="mt-8 divide-y divide-rose-100 border-y border-rose-100">
      {services.length === 0 && (
        <p className="py-6 text-neutral-500">
          Er zijn momenteel geen diensten beschikbaar.
        </p>
      )}
      {services.map((service) => (
        <div key={service.id} id={service.id} className="flex flex-wrap items-start justify-between gap-4 py-6">
          <div className="max-w-md">
            <h2 className="text-lg font-medium text-neutral-900">{service.name}</h2>
            {service.categories.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {service.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
            {service.description && (
              <p className="mt-1 text-sm text-neutral-600">{service.description}</p>
            )}
            <p className="mt-2 text-sm text-neutral-500">{service.durationMinutes} minuten</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-lg font-semibold text-rose-800">
              {formatCents(service.priceCents)}
            </span>
            <Link
              href={`/boeken?service=${service.id}`}
              className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
            >
              Boek nu
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pagina: /admin/diensten
 * Doel: Alle diensten tonen en filteren; navigatie naar nieuw/bewerken.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service.name, active, durationMinutes, priceCents, categories — via `listAllServices`
 * - ServiceCategory.id, name — via `listServiceCategories` (filterdropdown)
 *
 * Acties / mutaties (via child components of forms):
 * - geen (filters via GET searchParams; mutaties op nieuw/[id]-pagina’s)
 *
 * searchParams:
 * - `naam`, `categorie`, `prijsMin`, `prijsMax` — client-side filter op de opgehaalde lijst
 *
 * Lokale functies op deze pagina:
 * - `ServiceFilterForm`: laadt categorieën; render GET-filterformulier
 * - `ServiceList`: laadt alle diensten; filtert op searchParams; toont lijst
 * - `parseEuroToCents`: helper euro-string → centen
 */
import { Suspense } from "react";
import Link from "next/link";
import { listAllServices, listServiceCategories } from "@dal";
import { formatCents } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

export const metadata = { title: "Diensten beheren" };

type SearchParams = Promise<{
  naam?: string;
  categorie?: string;
  prijsMin?: string;
  prijsMax?: string;
}>;

export default async function AdminDienstenPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Diensten</h1>
        <Link
          href="/admin/diensten/nieuw"
          className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
        >
          Nieuwe dienst
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 rounded-lg border border-rose-100 bg-white p-4 lg:w-64">
          <h2 className="text-sm font-semibold text-neutral-900">Filter</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <ServiceFilterForm params={params} />
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          <Suspense
            key={`${params.naam ?? ""}-${params.categorie ?? ""}-${params.prijsMin ?? ""}-${params.prijsMax ?? ""}`}
            fallback={<LoadingSpinner />}
          >
            <ServiceList params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** Laadt ServiceCategory-opties en toont het GET-filterformulier. */
async function ServiceFilterForm({
  params,
}: {
  params: {
    naam?: string;
    categorie?: string;
    prijsMin?: string;
    prijsMax?: string;
  };
}) {
  const categories = await listServiceCategories();

  return (
    <form method="get" className="mt-4 space-y-4">
      <div>
        <label htmlFor="naam" className="block text-xs font-medium text-neutral-600">
          Naam
        </label>
        <input
          id="naam"
          name="naam"
          type="search"
          defaultValue={params.naam ?? ""}
          placeholder="Zoek op naam..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="categorie" className="block text-xs font-medium text-neutral-600">
          Categorie
        </label>
        <select
          id="categorie"
          name="categorie"
          defaultValue={params.categorie ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Alle categorieën</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-medium text-neutral-600">Prijs (€)</p>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="prijsMin" className="sr-only">
              Minimumprijs
            </label>
            <input
              id="prijsMin"
              name="prijsMin"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              defaultValue={params.prijsMin ?? ""}
              placeholder="Min"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="prijsMax" className="sr-only">
              Maximumprijs
            </label>
            <input
              id="prijsMax"
              name="prijsMax"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              defaultValue={params.prijsMax ?? ""}
              placeholder="Max"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          className="w-full rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
        >
          Toepassen
        </button>
        {(params.naam || params.categorie || params.prijsMin || params.prijsMax) && (
          <Link
            href="/admin/diensten"
            className="w-full rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Wis filters
          </Link>
        )}
      </div>
    </form>
  );
}

/** Haalt alle Services op via `listAllServices` en filtert op naam/categorie/prijs. */
async function ServiceList({
  params,
}: {
  params: {
    naam?: string;
    categorie?: string;
    prijsMin?: string;
    prijsMax?: string;
  };
}) {
  const services = await listAllServices();
  const nameNeedle = params.naam?.trim().toLowerCase() ?? "";
  const categoryId = params.categorie?.trim() ?? "";
  const minCents = parseEuroToCents(params.prijsMin);
  const maxCents = parseEuroToCents(params.prijsMax);

  const filtered = services.filter((service) => {
    if (nameNeedle && !service.name.toLowerCase().includes(nameNeedle)) return false;
    if (categoryId && !service.categories.some((c) => c.id === categoryId)) return false;
    if (minCents != null && service.priceCents < minCents) return false;
    if (maxCents != null && service.priceCents > maxCents) return false;
    return true;
  });

  const hasFilters = Boolean(nameNeedle || categoryId || minCents != null || maxCents != null);

  return (
    <div className="divide-y divide-rose-100 rounded-lg border border-rose-100">
      {filtered.length === 0 && (
        <p className="p-4 text-sm text-neutral-500">
          {services.length === 0
            ? "Nog geen diensten aangemaakt."
            : hasFilters
              ? "Geen diensten gevonden voor deze filters."
              : "Nog geen diensten aangemaakt."}
        </p>
      )}
      {filtered.map((service) => (
        <Link
          key={service.id}
          href={`/admin/diensten/${service.id}`}
          className="flex items-center justify-between p-4 text-sm hover:bg-rose-50"
        >
          <div>
            <p className="font-medium text-neutral-900">
              {service.name}
              {!service.active && (
                <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                  inactief
                </span>
              )}
            </p>
            <p className="text-neutral-500">
              {service.durationMinutes} min &middot; {formatCents(service.priceCents)}
              {service.categories.length > 0 && (
                <>
                  {" "}
                  &middot; {service.categories.map((c) => c.name).join(", ")}
                </>
              )}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function parseEuroToCents(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const amount = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

/**
 * Pagina: /admin/producten
 * Doel: Alle producten tonen en filteren; navigatie naar nieuw/bewerken.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Product.name, active, stockQuantity, outOfStockAt, priceCents, imageMimeType, brand, categories — via `listAllProducts`
 * - Brand.id, name — via `listBrands` (filterdropdown)
 * - ProductCategory.id, name — via `listProductCategories` (filterdropdown)
 *
 * Acties / mutaties (via child components of forms):
 * - geen (filters via GET searchParams; mutaties op nieuw/[id]-pagina’s)
 *
 * searchParams:
 * - `naam`, `merk`, `categorie`, `prijsMin`, `prijsMax`, `voorraad` (`actief`|`uitverkocht`) — filteren de opgehaalde lijst
 *
 * Lokale functies op deze pagina:
 * - `buildProductQuery`: bouwt querystring zodat tabs/filters elkaar niet wissen
 * - `StockFilterTabs`: UI-tabs voor voorraadfilter (geen fetch)
 * - `ProductFilterForm`: laadt merken/categorieën; GET-filterformulier
 * - `ProductList`: laadt alle producten; filtert op searchParams; toont lijst met thumbnail
 * - `parseEuroToCents`: helper euro-string → centen
 */
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { listAllProducts, listBrands, listProductCategories } from "@dal";
import { formatCents, formatDate } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

export const metadata = { title: "Producten beheren" };

type SearchParams = Promise<{
  naam?: string;
  merk?: string;
  categorie?: string;
  prijsMin?: string;
  prijsMax?: string;
  voorraad?: string;
}>;

type ProductFilterParams = {
  naam?: string;
  merk?: string;
  categorie?: string;
  prijsMin?: string;
  prijsMax?: string;
  voorraad?: string;
};

export default async function AdminProductenPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const listKey = [
    params.naam ?? "",
    params.merk ?? "",
    params.categorie ?? "",
    params.prijsMin ?? "",
    params.prijsMax ?? "",
    params.voorraad ?? "",
  ].join("-");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Producten</h1>
        <Link
          href="/admin/producten/nieuw"
          className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
        >
          Nieuw product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 rounded-lg border border-rose-100 bg-white p-4 lg:w-64">
          <h2 className="text-sm font-semibold text-neutral-900">Filter</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <ProductFilterForm params={params} />
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          <StockFilterTabs params={params} />
          <Suspense key={listKey} fallback={<LoadingSpinner />}>
            <ProductList params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** Bouwt de querystring opnieuw op zodat tabs/filters elkaar niet wissen. */
function buildProductQuery(params: ProductFilterParams, overrides: Partial<ProductFilterParams> = {}) {
  const merged = { ...params, ...overrides };
  const query = new URLSearchParams();
  if (merged.naam?.trim()) query.set("naam", merged.naam.trim());
  if (merged.merk?.trim()) query.set("merk", merged.merk.trim());
  if (merged.categorie?.trim()) query.set("categorie", merged.categorie.trim());
  if (merged.prijsMin?.trim()) query.set("prijsMin", merged.prijsMin.trim());
  if (merged.prijsMax?.trim()) query.set("prijsMax", merged.prijsMax.trim());
  if (merged.voorraad?.trim()) query.set("voorraad", merged.voorraad.trim());
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

function StockFilterTabs({ params }: { params: ProductFilterParams }) {
  const active =
    params.voorraad === "uitverkocht"
      ? "uitverkocht"
      : params.voorraad === "actief"
        ? "actief"
        : "alle";

  return (
    <div className="mb-4 flex gap-2 text-sm">
      {[
        { key: "alle", label: "Alle", voorraad: "" },
        { key: "actief", label: "Actief", voorraad: "actief" },
        { key: "uitverkocht", label: "Uitverkocht", voorraad: "uitverkocht" },
      ].map((tab) => (
        <Link
          key={tab.key}
          href={`/admin/producten${buildProductQuery(params, { voorraad: tab.voorraad })}`}
          className={`rounded-full px-3 py-1.5 ${
            active === tab.key ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-800"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

/** Laadt Brand- en ProductCategory-opties voor het GET-filterformulier. */
async function ProductFilterForm({ params }: { params: ProductFilterParams }) {
  const [brands, categories] = await Promise.all([listBrands(), listProductCategories()]);

  return (
    <form method="get" className="mt-4 space-y-4">
      {(params.voorraad === "uitverkocht" || params.voorraad === "actief") && (
        <input type="hidden" name="voorraad" value={params.voorraad} />
      )}

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
        <label htmlFor="merk" className="block text-xs font-medium text-neutral-600">
          Merk
        </label>
        <select
          id="merk"
          name="merk"
          defaultValue={params.merk ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Alle merken</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
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
        {(params.naam ||
          params.merk ||
          params.categorie ||
          params.prijsMin ||
          params.prijsMax ||
          params.voorraad) && (
          <Link
            href="/admin/producten"
            className="w-full rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Wis filters
          </Link>
        )}
      </div>
    </form>
  );
}

/**
 * Haalt alle Products op via `listAllProducts` (incl. Brand/ProductCategory) en filtert
 * op naam, merk, categorie, prijs en voorraadstatus.
 */
async function ProductList({ params }: { params: ProductFilterParams }) {
  const products = await listAllProducts();
  const nameNeedle = params.naam?.trim().toLowerCase() ?? "";
  const brandId = params.merk?.trim() ?? "";
  const categoryId = params.categorie?.trim() ?? "";
  const minCents = parseEuroToCents(params.prijsMin);
  const maxCents = parseEuroToCents(params.prijsMax);
  const onlyOutOfStock = params.voorraad === "uitverkocht";
  const onlyInStock = params.voorraad === "actief";

  const filtered = products.filter((product) => {
    if (onlyOutOfStock && product.stockQuantity > 0) return false;
    if (onlyInStock && product.stockQuantity <= 0) return false;
    if (nameNeedle && !product.name.toLowerCase().includes(nameNeedle)) return false;
    if (brandId && product.brand?.id !== brandId) return false;
    if (categoryId && !product.categories.some((c) => c.id === categoryId)) return false;
    if (minCents != null && product.priceCents < minCents) return false;
    if (maxCents != null && product.priceCents > maxCents) return false;
    return true;
  });

  const hasFilters = Boolean(
    onlyOutOfStock ||
      onlyInStock ||
      nameNeedle ||
      brandId ||
      categoryId ||
      minCents != null ||
      maxCents != null
  );

  return (
    <div className="divide-y divide-rose-100 rounded-lg border border-rose-100">
      {filtered.length === 0 && (
        <p className="p-4 text-sm text-neutral-500">
          {products.length === 0
            ? "Nog geen producten aangemaakt."
            : hasFilters
              ? onlyOutOfStock
                ? "Geen uitverkochte producten gevonden."
                : onlyInStock
                  ? "Geen actieve producten gevonden."
                  : "Geen producten gevonden voor deze filters."
              : "Nog geen producten aangemaakt."}
        </p>
      )}
      {filtered.map((product) => (
        <Link
          key={product.id}
          href={`/admin/producten/${product.id}`}
          className="flex items-center gap-4 p-4 text-sm hover:bg-rose-50"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-rose-50">
            {product.imageMimeType && (
              <Image
                src={`/api/products/${product.id}/image`}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-900">
              {product.name}
              {!product.active && (
                <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                  inactief
                </span>
              )}
              {product.stockQuantity <= 0 && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  uitverkocht
                </span>
              )}
            </p>
            <p className="text-neutral-500">
              Voorraad: {product.stockQuantity}
              {product.stockQuantity <= 0 && product.outOfStockAt && (
                <> &middot; sinds {formatDate(product.outOfStockAt.toISOString())}</>
              )}
              {product.brand && <> &middot; {product.brand.name}</>}
              {product.categories.length > 0 && (
                <> &middot; {product.categories.map((c) => c.name).join(", ")}</>
              )}
            </p>
          </div>
          <span className="font-medium text-rose-800">{formatCents(product.priceCents)}</span>
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

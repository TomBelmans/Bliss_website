import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { listActiveProducts } from "@dal";
import { formatCents } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

/**
 * Pagina: /winkel
 * Doel: Productcatalogus — grid van actieve verzorgingsproducten.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Product.id, Product.name, Product.priceCents, Product.stockQuantity,
 *   Product.imageMimeType, Product.volume,
 *   Product.brand.name, Product.contentUnit.name,
 *   Product.categories.id, Product.categories.name — via `listActiveProducts`
 *
 * Acties / mutaties (via child components of API):
 * - (geen; productkaarten linken naar `/winkel/[id]`; afbeelding via `/api/products/…/image`)
 *
 * Lokale functies op deze pagina:
 * - `ProductGrid`: haalt actieve producten op en rendert de grid; leest Product via DAL
 */
export const metadata: Metadata = {
  title: "Winkel",
  description: "Verzorgingsproducten van Bliss — Beauty by Norah, rechtstreeks online besteld.",
};

export const dynamic = "force-dynamic";

export default function WinkelPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">Winkel</h1>
      <p className="mt-2 text-neutral-600">Onze verzorgingsproducten, thuisbezorgd.</p>

      <Suspense fallback={<LoadingSpinner />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}

/** Grid van actieve producten met foto, merk, volume, categorieën en prijs. */
async function ProductGrid() {
  const products = await listActiveProducts();

  if (products.length === 0) {
    return <p className="mt-8 text-neutral-500">Er zijn momenteel geen producten beschikbaar.</p>;
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/winkel/${product.id}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-rose-100 transition hover:border-rose-300 hover:shadow-sm"
        >
          <div className="relative aspect-square w-full bg-rose-50">
            {product.imageMimeType ? (
              <Image
                src={`/api/products/${product.id}/image`}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-rose-300">
                Geen foto
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-3">
            {product.brand && (
              <span className="text-xs font-medium uppercase tracking-wide text-rose-700">
                {product.brand.name}
              </span>
            )}
            <h2 className="text-sm font-medium text-neutral-900">{product.name}</h2>
            {product.volume != null && (
              <span className="text-xs text-neutral-500">
                {product.volume}
                {product.contentUnit ? ` ${product.contentUnit.name}` : ""}
              </span>
            )}
            {product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
            <span className="text-sm font-semibold text-rose-800">
              {formatCents(product.priceCents)}
            </span>
            {product.stockQuantity <= 0 && (
              <span className="text-xs font-medium text-neutral-400">Uitverkocht</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getActiveProductById } from "@dal";
import { formatCents } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

/**
 * Pagina: /winkel/[id]
 * Doel: Productdetail met foto, info en “in winkelwagen”-knop.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Product.id, Product.name, Product.description, Product.priceCents,
 *   Product.stockQuantity, Product.imageMimeType, Product.volume,
 *   Product.brand.name, Product.contentUnit.name,
 *   Product.categories.id, Product.categories.name — via `getActiveProductById`
 *
 * Acties / mutaties (via child components of API):
 * - `AddToCartButton`: voegt item toe aan cart-context (localStorage); geen server call
 *
 * Lokale functies op deze pagina:
 * - `getProduct`: UUID-validatie + actief product laden; leest Product via DAL
 * - `generateMetadata`: titel/beschrijving uit productnaam/-omschrijving
 */
type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

/** UUID-check zodat een niet-uuid pad (bv. een oude slug-URL) een nette 404 geeft i.p.v. een databankfout. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Laadt een actief product op id, of `null` bij ongeldige UUID / niet gevonden. */
async function getProduct(idParam: string) {
  if (!UUID_PATTERN.test(idParam)) return null;
  return getActiveProductById(idParam);
}

/** Metadata (title/description) op basis van het product. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const imageUrl = product.imageMimeType ? `/api/products/${product.id}/image` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-rose-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-rose-300">
              Geen foto
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wide text-rose-700">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
          {product.volume != null && (
            <p className="mt-1 text-sm text-neutral-500">
              {product.volume}
              {product.contentUnit ? ` ${product.contentUnit.name}` : ""}
            </p>
          )}
          {product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xl font-semibold text-rose-800">
            {formatCents(product.priceCents)}
          </p>
          {product.description && (
            <p className="mt-4 text-neutral-600">{product.description}</p>
          )}
          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              priceCents={product.priceCents}
              imageUrl={imageUrl}
              inStock={product.stockQuantity > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

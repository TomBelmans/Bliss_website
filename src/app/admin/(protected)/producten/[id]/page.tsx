/**
 * Pagina: /admin/producten/[id]
 * Doel: Bestaand product bewerken of verwijderen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Product (incl. categorieën, brand, contentUnit) — via `getProductWithCategoriesById`
 * - ProductCategory / Brand / ContentUnit — via `listProductCategories`, `listBrands`, `listContentUnits`
 *
 * Acties / mutaties (via child components of forms):
 * - `updateProduct` (ProductForm) → DAL `updateProduct`
 * - `deleteProduct` (DeleteButton) → DAL `deleteProduct`
 * - `createProductCategory` / `createBrand` / `createContentUnit` (ProductForm) → bijbehorende DAL-creates
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { notFound } from "next/navigation";
import { getProductWithCategoriesById, listProductCategories, listBrands, listContentUnits } from "@dal";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateProduct, deleteProduct } from "@actions";

export const metadata = { title: "Product bewerken" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductBewerkenPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, brands, contentUnits] = await Promise.all([
    getProductWithCategoriesById(id),
    listProductCategories(),
    listBrands(),
    listContentUnits(),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">Product bewerken</h1>
      <div className="mt-6">
        <ProductForm
          product={product}
          allCategories={categories}
          allBrands={brands}
          allContentUnits={contentUnits}
          action={updateProduct.bind(null, id)}
        />
      </div>
      <div className="mt-8 border-t border-rose-100 pt-6">
        <DeleteButton
          action={deleteProduct.bind(null, { id })}
          confirmText={`"${product.name}" verwijderen? Dit kan niet ongedaan gemaakt worden.`}
        />
      </div>
    </div>
  );
}

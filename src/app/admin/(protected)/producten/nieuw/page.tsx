/**
 * Pagina: /admin/producten/nieuw
 * Doel: Nieuw product aanmaken.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - ProductCategory.id, name — via `listProductCategories`
 * - Brand.id, name — via `listBrands`
 * - ContentUnit.id, name — via `listContentUnits`
 *
 * Acties / mutaties (via child components of forms):
 * - `createProduct` (ProductForm) → DAL `createProduct` — Product (+ categorieën, optioneel afbeelding)
 * - `createProductCategory` / `createBrand` / `createContentUnit` (ProductForm) → bijbehorende DAL-creates
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { listProductCategories, listBrands, listContentUnits } from "@dal";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@actions";

export const metadata = { title: "Nieuw product" };

export default async function NieuwProductPage() {
  const [categories, brands, contentUnits] = await Promise.all([
    listProductCategories(),
    listBrands(),
    listContentUnits(),
  ]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">Nieuw product</h1>
      <div className="mt-6">
        <ProductForm
          allCategories={categories}
          allBrands={brands}
          allContentUnits={contentUnits}
          action={createProduct}
        />
      </div>
    </div>
  );
}

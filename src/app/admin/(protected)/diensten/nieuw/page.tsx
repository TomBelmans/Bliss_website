/**
 * Pagina: /admin/diensten/nieuw
 * Doel: Nieuwe dienst aanmaken.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - ServiceCategory.id, name — via `listServiceCategories` (voor CategoryPicker)
 *
 * Acties / mutaties (via child components of forms):
 * - `createService` (ServiceForm) → DAL `createService` — Service (+ categoriekoppelingen)
 * - `createServiceCategory` (ServiceForm/CategoryPicker) → DAL `createServiceCategory`
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { listServiceCategories } from "@dal";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { createService } from "@actions";

export const metadata = { title: "Nieuwe dienst" };

export default async function NieuweDienstPage() {
  const categories = await listServiceCategories();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">Nieuwe dienst</h1>
      <div className="mt-6">
        <ServiceForm allCategories={categories} action={createService} />
      </div>
    </div>
  );
}

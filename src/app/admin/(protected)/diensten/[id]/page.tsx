/**
 * Pagina: /admin/diensten/[id]
 * Doel: Bestaande dienst bewerken of verwijderen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service (incl. categorieën) — via `getServiceById`
 * - ServiceCategory.id, name — via `listServiceCategories`
 *
 * Acties / mutaties (via child components of forms):
 * - `updateService` (ServiceForm) → DAL `updateService`
 * - `deleteService` (DeleteButton) → DAL `deleteService`
 * - `createServiceCategory` (ServiceForm/CategoryPicker) → DAL `createServiceCategory`
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { notFound } from "next/navigation";
import { getServiceById, listServiceCategories } from "@dal";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateService, deleteService } from "@actions";

export const metadata = { title: "Dienst bewerken" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DienstBewerkenPage({ params }: Props) {
  const { id } = await params;
  const [service, categories] = await Promise.all([getServiceById(id), listServiceCategories()]);

  if (!service) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">Dienst bewerken</h1>
      <div className="mt-6">
        <ServiceForm service={service} allCategories={categories} action={updateService.bind(null, id)} />
      </div>
      <div className="mt-8 border-t border-rose-100 pt-6">
        <DeleteButton
          action={deleteService.bind(null, { id })}
          confirmText={`"${service.name}" verwijderen? Dit kan niet ongedaan gemaakt worden.`}
        />
      </div>
    </div>
  );
}

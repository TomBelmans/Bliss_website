/**
 * Server actions voor diensten: aanmaken, bijwerken en verwijderen (admin).
 * Wrappers: `formAction` / `serverFunction`; DAL: `services.ts`.
 * UI: admin ServiceForm / diensten-detail.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formAction, serverFunction } from "@mediators";
import { serviceFormServerSchema } from "@schemas";
import type { ServerFunctionResponse } from "@models";
import {
  createService as createServiceDal,
  updateService as updateServiceDal,
  deleteService as deleteServiceDal,
} from "@dal";

/**
 * Nieuwe dienst aanmaken.
 * Wrapper: `formAction` → DAL `createService`. UI: admin dienstformulier (nieuw).
 */
export const createService = formAction(serviceFormServerSchema, async (data) => {
  await createServiceDal(
    {
      name: data.name,
      description: data.description || null,
      durationMinutes: data.durationMinutes,
      priceCents: Math.round(data.price * 100),
      active: data.active,
    },
    data.categoryIds
  );

  revalidatePath("/admin/diensten");
  revalidatePath("/diensten");
  redirect("/admin/diensten");
});

/**
 * Next.js vereist dat elke export van een `"use server"`-bestand zelf een
 * async functie is — een factory die een actie retourneert mag niet.
 * Daarom is `id` hier het eerste parameter en bind je 'm vanuit de pagina
 * met `updateService.bind(null, id)`, exact zoals Next's eigen patroon
 * voor extra argumenten bij `useActionState`.
 * Wrapper: `formAction` → DAL `updateService`. UI: admin dienstformulier.
 */
export async function updateService(
  id: string,
  prevState: ServerFunctionResponse,
  formData: FormData
): Promise<ServerFunctionResponse> {
  return formAction(serviceFormServerSchema, async (data) => {
    await updateServiceDal(
      id,
      {
        name: data.name,
        description: data.description || null,
        durationMinutes: data.durationMinutes,
        priceCents: Math.round(data.price * 100),
        active: data.active,
      },
      data.categoryIds
    );

    revalidatePath("/admin/diensten");
    revalidatePath("/diensten");
    redirect("/admin/diensten");
  })(prevState, formData);
}

/**
 * Dienst hard verwijderen.
 * Wrapper: `serverFunction` → DAL `deleteService`. UI: admin diensten-detail.
 */
export const deleteService = serverFunction(z.object({ id: z.string().uuid() }), async ({ id }) => {
  await deleteServiceDal(id);
  revalidatePath("/admin/diensten");
  revalidatePath("/diensten");
  redirect("/admin/diensten");
});

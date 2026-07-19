/**
 * Server actions voor bestellingen: status wijzigen (admin).
 * Wrapper: `formAction`; DAL: `updateOrderStatus`.
 * UI: admin bestelling-detailpagina.
 */
"use server";

import { revalidatePath } from "next/cache";
import { formAction } from "@mediators";
import { updateOrderStatusSchema } from "@schemas";
import { updateOrderStatus as updateOrderStatusDal } from "@dal";
import type { ServerFunctionResponse } from "@models";

/**
 * Orderstatus bijwerken. Bind `id` met `updateOrderStatus.bind(null, id)`.
 * Wrapper: `formAction` → DAL `updateOrderStatus`. UI: admin bestelling-detail.
 */
export async function updateOrderStatus(
  id: string,
  prevState: ServerFunctionResponse,
  formData: FormData
): Promise<ServerFunctionResponse> {
  return formAction(updateOrderStatusSchema, async (data) => {
    await updateOrderStatusDal(id, data.status);
    revalidatePath("/admin/bestellingen");
    revalidatePath(`/admin/bestellingen/${id}`);
  })(prevState, formData);
}

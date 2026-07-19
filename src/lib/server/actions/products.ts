/**
 * Server actions voor producten: aanmaken, bijwerken en verwijderen (admin).
 * Wrappers: `formAction` / `serverFunction`; DAL: `products.ts`.
 * UI: `ProductForm` en admin producten-detail (delete).
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formAction, serverFunction } from "@mediators";
import { productFormServerSchema } from "@schemas";
import {
  createProduct as createProductDal,
  updateProduct as updateProductDal,
  deleteProduct as deleteProductDal,
} from "@dal";
import type { UpdateProductParams, ServerFunctionResponse } from "@models";

/** Leest de meegegeven foto (indien aanwezig) als bytes, klaar om rechtstreeks in Postgres op te slaan. */
async function readImageIfProvided(
  formData?: FormData
): Promise<{ image: Uint8Array<ArrayBuffer>; imageMimeType: string } | null> {
  const file = formData?.get("image");
  if (!(file instanceof File) || file.size === 0) return null;

  const arrayBuffer = await file.arrayBuffer();
  return {
    image: new Uint8Array(arrayBuffer),
    imageMimeType: file.type || "application/octet-stream",
  };
}

/**
 * Nieuw product aanmaken (incl. optionele foto).
 * Wrapper: `formAction` → DAL `createProduct`. UI: `ProductForm` (nieuw).
 */
export const createProduct = formAction(productFormServerSchema, async (data, _profile, formData) => {
  const imageData = await readImageIfProvided(formData);

  await createProductDal(
    {
      name: data.name,
      description: data.description || null,
      priceCents: Math.round(data.price * 100),
      stockQuantity: data.stockQuantity,
      active: data.active,
      volume: data.volume ?? null,
      brandId: data.brandId,
      contentUnitId: data.contentUnitId,
      ...(imageData ?? {}),
    },
    data.categoryIds
  );

  revalidatePath("/admin/producten");
  revalidatePath("/winkel");
  redirect("/admin/producten");
});

/**
 * Product bijwerken. Bind `id` vanuit de pagina met `updateProduct.bind(null, id)`.
 * Wrapper: `formAction` → DAL `updateProduct`. UI: `ProductForm` (bewerken).
 */
export async function updateProduct(
  id: string,
  prevState: ServerFunctionResponse,
  formData: FormData
): Promise<ServerFunctionResponse> {
  return formAction(productFormServerSchema, async (data, _profile, rawFormData) => {
    const imageData = await readImageIfProvided(rawFormData);

    const update: UpdateProductParams = {
      name: data.name,
      description: data.description || null,
      priceCents: Math.round(data.price * 100),
      stockQuantity: data.stockQuantity,
      active: data.active,
      volume: data.volume ?? null,
      brandId: data.brandId,
      contentUnitId: data.contentUnitId,
    };
    if (imageData) {
      update.image = imageData.image;
      update.imageMimeType = imageData.imageMimeType;
    }

    await updateProductDal(id, update, data.categoryIds);

    revalidatePath("/admin/producten");
    revalidatePath("/winkel");
    redirect("/admin/producten");
  })(prevState, formData);
}

/**
 * Product hard verwijderen.
 * Wrapper: `serverFunction` → DAL `deleteProduct`. UI: admin producten-detail.
 */
export const deleteProduct = serverFunction(z.object({ id: z.string().uuid() }), async ({ id }) => {
  await deleteProductDal(id);
  revalidatePath("/admin/producten");
  revalidatePath("/winkel");
  redirect("/admin/producten");
});

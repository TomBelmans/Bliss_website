/**
 * Server actions om dienst-/productcategorieën inline aan te maken (admin).
 * Geen formAction-wrapper (caller heeft de nieuwe id nodig); DAL: `categories.ts`.
 * UI: `CategoryPicker` in ServiceForm / ProductForm.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@mediators";
import { categoryNameSchema } from "@schemas";
import {
  createServiceCategory as createServiceCategoryDal,
  createProductCategory as createProductCategoryDal,
} from "@dal";

export type CreateCategoryResult =
  | { success: true; id: string; name: string }
  | { success: false; error: string };

/**
 * Rechtstreeks aanroepbaar vanuit de admin-formulieren (geen
 * `formAction`-wrapper, omdat de aanroeper de nieuwe categorie-id terug
 * nodig heeft om ze meteen aan te vinken).
 * DAL: `createServiceCategory`. UI: CategoryPicker (diensten).
 */
export async function createServiceCategory(name: string): Promise<CreateCategoryResult> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { success: false, error: "Niet aangemeld als beheerder." };
  }

  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ongeldige categorienaam." };
  }

  try {
    const category = await createServiceCategoryDal(parsed.data);
    revalidatePath("/admin/diensten");
    return { success: true, id: category.id, name: category.name };
  } catch {
    return { success: false, error: "Deze categorie bestaat al." };
  }
}

/**
 * Nieuwe productcategorie aanmaken (sessiecheck + validatie).
 * DAL: `createProductCategory`. UI: CategoryPicker (producten).
 */
export async function createProductCategory(name: string): Promise<CreateCategoryResult> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { success: false, error: "Niet aangemeld als beheerder." };
  }

  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ongeldige categorienaam." };
  }

  try {
    const category = await createProductCategoryDal(parsed.data);
    revalidatePath("/admin/producten");
    return { success: true, id: category.id, name: category.name };
  } catch {
    return { success: false, error: "Deze categorie bestaat al." };
  }
}

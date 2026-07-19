/**
 * Server actions om merken/inhoudseenheden inline aan te maken (admin).
 * Geen formAction-wrapper (caller heeft de nieuwe id nodig); DAL: `productAttributes.ts`.
 * UI: `ProductForm` / EntitySelect.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@mediators";
import { brandNameSchema, contentUnitNameSchema } from "@schemas";
import { createBrand as createBrandDal, createContentUnit as createContentUnitDal } from "@dal";

export type CreateAttributeResult =
  | { success: true; id: string; name: string }
  | { success: false; error: string };

/**
 * Rechtstreeks aanroepbaar vanuit het admin-productformulier (geen
 * `formAction`-wrapper, omdat de aanroeper de nieuwe id terug nodig heeft
 * om ze meteen te selecteren).
 * DAL: `createBrand`. UI: ProductForm EntitySelect (merk).
 */
export async function createBrand(name: string): Promise<CreateAttributeResult> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { success: false, error: "Niet aangemeld als beheerder." };
  }

  const parsed = brandNameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ongeldige merknaam." };
  }

  try {
    const brand = await createBrandDal(parsed.data);
    revalidatePath("/admin/producten");
    return { success: true, id: brand.id, name: brand.name };
  } catch {
    return { success: false, error: "Dit merk bestaat al." };
  }
}

/**
 * Nieuwe inhoudseenheid aanmaken (sessiecheck + validatie).
 * DAL: `createContentUnit`. UI: ProductForm EntitySelect (eenheid).
 */
export async function createContentUnit(name: string): Promise<CreateAttributeResult> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { success: false, error: "Niet aangemeld als beheerder." };
  }

  const parsed = contentUnitNameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ongeldige eenheid." };
  }

  try {
    const unit = await createContentUnitDal(parsed.data);
    revalidatePath("/admin/producten");
    return { success: true, id: unit.id, name: unit.name };
  } catch {
    return { success: false, error: "Deze eenheid bestaat al." };
  }
}

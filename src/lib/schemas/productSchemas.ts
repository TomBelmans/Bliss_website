import { z } from "zod";
import { categoryIdsField } from "./categorySchemas";
import { optionalEntityIdField } from "./productAttributeSchemas";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht."),
  description: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Prijs kan niet negatief zijn."),
  stockQuantity: z.coerce.number().int().min(0, "Voorraad kan niet negatief zijn."),
  // Leeg gelaten → geen volume ingesteld (i.p.v. de foutmelding die
  // z.coerce.number() bij een lege string zou geven).
  volume: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(0, "Volume kan niet negatief zijn.").optional()
  ),
  brandId: optionalEntityIdField,
  contentUnitId: optionalEntityIdField,
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** Server-variant met de categorie-selectie (JSON-hidden-veld, zie categorySchemas.ts). */
export const productFormServerSchema = productFormSchema.extend({
  categoryIds: categoryIdsField,
});

import { z } from "zod";
import { categoryIdsField } from "./categorySchemas";

export const serviceFormSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht."),
  description: z.string().trim().optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(1, "Duur moet minstens 1 minuut zijn."),
  price: z.coerce.number().min(0, "Prijs kan niet negatief zijn."),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

/**
 * Server-variant: het formulier stuurt de categorie-selectie mee als
 * JSON-hidden-veld, buiten react-hook-form om (zie categorySchemas.ts).
 */
export const serviceFormServerSchema = serviceFormSchema.extend({
  categoryIds: categoryIdsField,
});

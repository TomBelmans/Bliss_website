import { z } from "zod";

export const brandNameSchema = z
  .string()
  .trim()
  .min(1, "Vul een merknaam in.")
  .max(255, "Merknaam is te lang.");

export const contentUnitNameSchema = z
  .string()
  .trim()
  .min(1, "Vul een eenheid in.")
  .max(50, "Eenheid is te lang (max. 50 tekens).");

/**
 * Een optioneel geselecteerd merk/inhoudseenheid vanuit een <select>: een
 * lege string (de "Geen merk"-optie) wordt `null`, een ingevulde waarde
 * moet een geldige uuid zijn.
 */
export const optionalEntityIdField = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const result = z.string().uuid().safeParse(value);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: "Ongeldige selectie." });
      return z.NEVER;
    }
    return result.data;
  });

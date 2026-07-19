import { z } from "zod";

/** Naam voor een nieuwe dienst-/productcategorie. */
export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Vul een categorienaam in.")
  .max(255, "Categorienaam is te lang.");

/**
 * De categorie-selectie reist als één JSON-string mee in een hidden input
 * (want `convertFormData` houdt bij herhaalde keys enkel de laatste waarde
 * over). Dit veld parseert die string naar een lijst categorie-id's.
 */
export const categoryIdsField = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) return [] as string[];
    try {
      const parsed: unknown = JSON.parse(value);
      const result = z.array(z.string().uuid()).safeParse(parsed);
      if (!result.success) throw new Error("invalid");
      return result.data;
    } catch {
      ctx.addIssue({ code: "custom", message: "Ongeldige categorie-selectie." });
      return z.NEVER;
    }
  });

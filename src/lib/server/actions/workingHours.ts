/**
 * Server actions voor openingsuren (admin kalender).
 * Wrapper: `serverFunction`; DAL: `upsertWorkingHours`.
 * UI: admin kalenderpagina.
 */
"use server";

import { revalidatePath } from "next/cache";
import { serverFunction } from "@mediators";
import { saveWorkingHoursSchema } from "@schemas";
import { upsertWorkingHours } from "@dal";

/**
 * Slaat alle weekdagen openingsuren op.
 * Wrapper: `serverFunction` → DAL `upsertWorkingHours`. UI: admin `/admin/kalender`.
 */
export const saveWorkingHours = serverFunction(saveWorkingHoursSchema, async ({ days }) => {
  await upsertWorkingHours(days);
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/boekingen");
});

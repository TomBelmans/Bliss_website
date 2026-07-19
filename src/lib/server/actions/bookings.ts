/**
 * Server actions voor boekingen: annuleren door admin of door de klant zelf.
 * Wrappers: `serverFunction` / `customerServerFunction`; DAL: `updateBookingStatus`,
 * `getBookingById`. UI: admin boekingen-detail, `CancelOwnBookingButton`.
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { customerServerFunction, serverFunction } from "@mediators";
import { getBookingById, updateBookingStatus } from "@dal";

/**
 * Admin annuleert een boeking.
 * Wrapper: `serverFunction` → DAL `updateBookingStatus`.
 * UI: admin boekingen-detailpagina.
 */
export const cancelBooking = serverFunction(z.object({ id: z.string().uuid() }), async ({ id }) => {
  await updateBookingStatus(id, "CANCELLED");
  revalidatePath("/admin/boekingen");
  revalidatePath(`/admin/boekingen/${id}`);
});

/**
 * Klant annuleert de eigen toekomstige afspraak. Alleen toegestaan voor
 * boekingen die aan dit account hangen en nog niet begonnen zijn.
 * Wrapper: `customerServerFunction` → DAL `getBookingById` + `updateBookingStatus`.
 * UI: `CancelOwnBookingButton` op `/account`.
 */
export const cancelOwnBooking = customerServerFunction(
  z.object({ id: z.string().uuid() }),
  async ({ id }, profile) => {
    const booking = await getBookingById(id);
    if (!booking || booking.customerId !== profile.id) {
      return { success: false, errors: { errors: ["Boeking niet gevonden."] } };
    }
    if (booking.status === "CANCELLED") {
      return { success: true };
    }
    if (booking.startsAt.getTime() <= Date.now()) {
      return {
        success: false,
        errors: { errors: ["Een afspraak die al is geweest kan je niet meer annuleren."] },
      };
    }

    await updateBookingStatus(id, "CANCELLED");
    revalidatePath("/account");
    revalidatePath("/admin/boekingen");
    revalidatePath(`/admin/boekingen/${id}`);
  }
);

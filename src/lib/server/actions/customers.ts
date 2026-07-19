/**
 * Server actions voor klantaccounts: registreren, inloggen, uitloggen,
 * profiel wijzigen, account verwijderen en gasten koppelen.
 * Wrappers: direct / `serverFunction` / `customerServerFunction`;
 * DAL: `customers.ts`. UI: account-formulieren, BookingForm, WinkelwagenCart, admin.
 */
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  anonymizeCustomer,
  createCustomer,
  getCustomerByEmail,
  linkGuestToCustomer as linkGuestToCustomerDal,
  signInCustomer as signInCustomerDal,
  startCustomerSession,
  stopCustomerSession,
  updateCustomerProfile,
} from "@dal";
import { setCustomerSessionCookie, clearCustomerSessionCookie, getCustomerSessionId } from "@serverUtils";
import { customerServerFunction, serverFunction } from "@mediators";
import { updateCustomerProfileSchema } from "@schemas";
import type { CustomerProfile } from "@models";

export type RegisterCustomerParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

export type CustomerAuthResult =
  | { success: true; profile: CustomerProfile }
  | { success: false; error: string };

/**
 * Maakt een klantaccount aan en start meteen een sessie. Rechtstreeks
 * aanroepbaar (geen `publicFormAction`-wrapper), omdat dit vanuit JSON
 * API-routes gebeurt (`/api/bookings`, `/api/checkout` via de winkelwagen)
 * i.p.v. vanuit een `<form>`-submit.
 * DAL: `createCustomer`, `startCustomerSession`. UI: BookingForm, WinkelwagenCart.
 */
export async function registerCustomer(data: RegisterCustomerParams): Promise<CustomerAuthResult> {
  const existing = await getCustomerByEmail(data.email);
  if (existing) {
    return { success: false, error: "Er bestaat al een account met dit e-mailadres." };
  }

  const { password, phone, ...rest } = data;
  const profile = await createCustomer({
    ...rest,
    phone: phone?.trim() ? phone.trim() : null,
    plainTextPassword: password,
  });
  const session = await startCustomerSession(profile.id);
  await setCustomerSessionCookie(session);
  return { success: true, profile };
}

/**
 * Klant inloggen + sessiecookie zetten. Rechtstreeks aanroepbaar.
 * DAL: `signInCustomer`. UI: AccountLoginForm, BookingForm, WinkelwagenCart.
 */
export async function signInCustomer(email: string, password: string): Promise<CustomerAuthResult> {
  const result = await signInCustomerDal(email, password);
  if (!result) {
    return { success: false, error: "Ongeldig e-mailadres of wachtwoord." };
  }

  await setCustomerSessionCookie(result.session);
  return { success: true, profile: result.profile };
}

/**
 * Klant uitloggen: sessie wissen + cookie clear + redirect.
 * DAL: `stopCustomerSession`. UI: account-layout/uitlogknop.
 */
export async function signOutCustomer(): Promise<void> {
  const sessionId = await getCustomerSessionId();
  if (sessionId) {
    await stopCustomerSession(sessionId);
  }
  await clearCustomerSessionCookie();
  redirect("/account");
}

/**
 * Koppelt gastboekingen/-bestellingen aan een bestaande klant (klant is leidend).
 * Wrapper: `serverFunction` → DAL `linkGuestToCustomer`.
 * UI: admin gast-detailpagina.
 */
export const linkGuestToCustomer = serverFunction(
  z.object({
    guestEmail: z.string().trim().email(),
    customerId: z.string().uuid(),
  }),
  async ({ guestEmail, customerId }) => {
    await linkGuestToCustomerDal(guestEmail, customerId);
    revalidatePath("/admin/klanten");
    revalidatePath(`/admin/klanten/${customerId}`);
    revalidatePath("/admin/boekingen");
    redirect(`/admin/klanten/${customerId}`);
  }
);

/**
 * Klant wijzigt eigen profiel (SCD2: vorige status naar CustomerHistory).
 * Wrapper: `customerServerFunction` → DAL `updateCustomerProfile`.
 * UI: `AccountProfileForm`.
 */
export const updateOwnProfile = customerServerFunction(
  updateCustomerProfileSchema,
  async (data, profile) => {
    try {
      await updateCustomerProfile(profile.id, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone?.trim() ? data.phone.trim() : null,
        street: data.street,
        houseNumber: data.houseNumber,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Opslaan is mislukt.";
      return { success: false, errors: { errors: [message] } };
    }
    revalidatePath("/account");
    revalidatePath("/admin/klanten");
  }
);

/**
 * Klant verwijdert eigen account: soft-delete + GDPR-anonimisatie.
 * Boekingen/orders blijven gekoppeld via customerId voor de boekhouding.
 * Wrapper: `customerServerFunction` → DAL `anonymizeCustomer`.
 * UI: `DeleteAccountButton`.
 */
export const deleteOwnAccount = customerServerFunction(z.object({}), async (_data, profile) => {
  try {
    await anonymizeCustomer(profile.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verwijderen is mislukt.";
    return { success: false, errors: { errors: [message] } };
  }
  await clearCustomerSessionCookie();
  revalidatePath("/account");
  revalidatePath("/admin/klanten");
  redirect("/account");
});

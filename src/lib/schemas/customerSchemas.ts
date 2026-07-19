import { z } from "zod";

export const customerSignInSchema = z.object({
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  password: z.string().min(1, "Vul je wachtwoord in."),
});

export type CustomerSignInInput = z.infer<typeof customerSignInSchema>;

/** Adres- en identiteitsvelden die bij het aanmaken van een klantaccount ingevuld moeten worden. */
export const customerAddressFields = {
  firstName: z.string().trim().min(1, "Vul je voornaam in."),
  lastName: z.string().trim().min(1, "Vul je achternaam in."),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  street: z.string().trim().min(1, "Vul je straat in."),
  houseNumber: z.string().trim().min(1, "Vul je huisnummer in."),
  postalCode: z.string().trim().min(1, "Vul je postcode in."),
  city: z.string().trim().min(1, "Vul je gemeente in."),
  country: z.string().trim().min(1, "Vul je land in."),
};

/** Profiel wijzigen vanuit Mijn account (zonder wachtwoordwijziging). */
export const updateCustomerProfileSchema = z.object({
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  ...customerAddressFields,
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

export const registerCustomerSchema = z
  .object({
    email: z.string().trim().email("Vul een geldig e-mailadres in."),
    password: z.string().min(8, "Wachtwoord moet minstens 8 tekens lang zijn."),
    passwordConfirmation: z.string().min(1, "Bevestig je wachtwoord."),
    ...customerAddressFields,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Wachtwoorden komen niet overeen.",
    path: ["passwordConfirmation"],
  });

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

/**
 * Voor winkelwagen én boekingen: klant kiest expliciet tussen inloggen of
 * een account aanmaken. Auth gebeurt client-side vóór de checkout/booking-call.
 */
export const customerAuthSchema = z
  .discriminatedUnion("mode", [
    z.object({
      mode: z.literal("login"),
      email: z.string().trim().email("Vul een geldig e-mailadres in."),
      password: z.string().min(1, "Vul je wachtwoord in."),
    }),
    z.object({
      mode: z.literal("register"),
      email: z.string().trim().email("Vul een geldig e-mailadres in."),
      password: z.string().min(8, "Wachtwoord moet minstens 8 tekens lang zijn."),
      passwordConfirmation: z.string().min(1, "Bevestig je wachtwoord."),
      ...customerAddressFields,
    }),
  ])
  .superRefine((data, ctx) => {
    if (data.mode === "register" && data.password !== data.passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Wachtwoorden komen niet overeen.",
        path: ["passwordConfirmation"],
      });
    }
  });

export type CustomerAuthInput = z.infer<typeof customerAuthSchema>;

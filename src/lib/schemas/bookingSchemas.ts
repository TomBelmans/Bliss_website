import { z } from "zod";
import { customerAddressFields } from "./customerSchemas";

/**
 * Boeken kan alleen met een account: de klant logt in op een bestaand
 * account of maakt er ter plekke één aan. Een discriminated union zodat
 * enkel de relevante velden verplicht zijn per keuze.
 */
export const bookingAccountSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("login"),
    password: z.string().min(1, "Vul je wachtwoord in."),
  }),
  z.object({
    mode: z.literal("register"),
    password: z.string().min(8, "Wachtwoord moet minstens 8 tekens lang zijn."),
    passwordConfirmation: z.string().min(1, "Bevestig je wachtwoord."),
    ...customerAddressFields,
  }),
]);

export const createBookingSchema = z
  .object({
    serviceId: z.string().uuid(),
    startsAt: z.string().datetime(),
    customerName: z.string().trim().min(1).max(200),
    customerEmail: z.string().trim().email(),
    customerPhone: z.string().trim().max(50).optional().or(z.literal("")),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
    // Weggelaten wanneer de klant al ingelogd is (sessie-cookie) of wanneer
    // de beheerder een telefonische/walk-in boeking invoert; in alle andere
    // gevallen verplicht — de route dwingt dat af.
    account: bookingAccountSchema.optional(),
    // Enkel voor de beheerder: koppel de boeking aan een bestaande klant.
    // De route weigert dit veld zonder admin-sessie.
    customerId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.account?.mode === "register" &&
      data.account.password !== data.account.passwordConfirmation
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Wachtwoorden komen niet overeen.",
        path: ["account", "passwordConfirmation"],
      });
    }
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  password: z.string().min(1, "Vul je wachtwoord in."),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vul je huidige wachtwoord in."),
    newPassword: z.string().min(8, "Nieuw wachtwoord moet minstens 8 tekens lang zijn."),
    newPasswordConfirmation: z.string().min(1, "Bevestig je nieuwe wachtwoord."),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Wachtwoorden komen niet overeen.",
    path: ["newPasswordConfirmation"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

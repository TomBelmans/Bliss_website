import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Vul je naam in."),
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  phone: z.string().trim().optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Je bericht mag minstens 10 tekens lang zijn.")
    .max(2000, "Je bericht mag max. 2000 tekens lang zijn."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

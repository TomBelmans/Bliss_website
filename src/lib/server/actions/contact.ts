/**
 * Server action voor het publieke contactformulier.
 * Wrapper: `publicFormAction`; geen DAL (logt server-side tot e-mailprovider).
 * UI: contactpagina-formulier.
 */
"use server";

import { publicFormAction } from "@mediators";
import { contactFormSchema } from "@schemas";
import { contactInfo } from "@/lib/contact";

/**
 * Verwerkt een contactformulier. Zonder e-mailprovider loggen we het bericht
 * server-side; later kan hier bv. Resend/Nodemailer naartoe gestuurd worden
 * (naar `contactInfo.email`).
 * Wrapper: `publicFormAction`. UI: contactformulier.
 */
export const submitContactForm = publicFormAction(contactFormSchema, (data) => {
  console.info("[contact-form]", {
    to: contactInfo.email,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
  });

  return Promise.resolve({ success: true });
});

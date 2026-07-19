/**
 * Gedeelde contactgegevens voor footer en contactpagina.
 * Bron: environment variables (zie `env.salon` / README).
 */
import { env } from "@/lib/env";

function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits || phone}`;
}

const salon = env.salon();

export const contactInfo = {
  email: salon.email,
  phone: salon.phone,
  phoneHref: phoneToTelHref(salon.phone),
  addressLines: [salon.street, `${salon.postalCode} ${salon.city}, ${salon.country}`],
  /** Volledige tekst voor Google Maps-zoekopdracht / embed. */
  mapsQuery: `${salon.street}, ${salon.postalCode} ${salon.city}, ${salon.country}`,
} as const;

/** Embed-URL voor Google Maps. */
export const contactMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.mapsQuery)}&z=13&output=embed`;

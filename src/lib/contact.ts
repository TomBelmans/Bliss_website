/**
 * Gedeelde contactgegevens voor footer en contactpagina.
 * Pas deze waarden aan naar de echte gegevens van Bliss — Beauty by Norah.
 */
export const contactInfo = {
  email: "hello@jouwdomein.be",
  phone: "+32 4xx xx xx xx",
  phoneHref: "tel:+32400000000",
  addressLines: ["Speltstraat 28", "2400 Mol, België"],
  /** Volledige tekst voor Google Maps-zoekopdracht / embed. */
  mapsQuery: "Speltstraat 28, 2400 Mol, België",
} as const;

/** Embed-URL voor Google Maps (vervang door een echte embed-URL indien gewenst). */
export const contactMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.mapsQuery)}&z=13&output=embed`;

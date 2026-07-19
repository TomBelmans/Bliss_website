/**
 * Centrale plek om environment variables op te halen met duidelijke
 * foutmeldingen als er iets ontbreekt in .env.local (of in de Vercel/
 * Netlify project settings).
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Ontbrekende environment variable "${name}". Zie README.md sectie 3 voor de volledige lijst.`
    );
  }
  return value;
}

export const env = {
  databaseUrl: () => required("DATABASE_URL", process.env.DATABASE_URL),
  stripe: {
    secretKey: () => required("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY),
    webhookSecret: () => required("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET),
    publishableKey: () =>
      required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  },
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  calendarFeedSecret: () =>
    required("CALENDAR_FEED_SECRET", process.env.CALENDAR_FEED_SECRET),
  /**
   * Publieke saloncontactgegevens (footer + /contact).
   * Defaults houden lokale ontwikkeling werkend tot .env is ingevuld.
   */
  salon: () => ({
    email: process.env.NEXT_PUBLIC_SALON_EMAIL ?? "hello@jouwdomein.be",
    phone: process.env.NEXT_PUBLIC_SALON_PHONE ?? "+32 4xx xx xx xx",
    street: process.env.NEXT_PUBLIC_SALON_STREET ?? "Speltstraat 28",
    postalCode: process.env.NEXT_PUBLIC_SALON_POSTAL_CODE ?? "2400",
    city: process.env.NEXT_PUBLIC_SALON_CITY ?? "Mol",
    country: process.env.NEXT_PUBLIC_SALON_COUNTRY ?? "België",
  }),
};

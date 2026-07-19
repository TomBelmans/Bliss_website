import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { contactInfo, contactMapsEmbedUrl } from "@/lib/contact";

/**
 * Pagina: /contact
 * Doel: Contactgegevens, kaart en contactformulier tonen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - (geen DB; pure UI + statische `contactInfo` / `contactMapsEmbedUrl` uit `@/lib/contact`)
 *
 * Acties / mutaties (via child components of API):
 * - `ContactForm`: server action `submitContactForm` (e-mailbericht)
 *
 * Lokale functies op deze pagina:
 * - (geen)
 */
export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met Bliss — Beauty by Norah voor vragen of een afspraak.",
};

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Contact</p>
          <h1 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">
            Laten we praten
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-charcoal-soft">
            Vragen over een behandeling of product? Stuur een bericht — we antwoorden zo snel
            mogelijk.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal">
                Gegevens
              </p>
              <ul className="mt-4 space-y-3 text-sm text-charcoal-soft">
                <li>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="transition hover:text-charcoal"
                  >
                    {contactInfo.email}
                  </a>
                </li>
                <li>
                  <a href={contactInfo.phoneHref} className="transition hover:text-charcoal">
                    {contactInfo.phone}
                  </a>
                </li>
                {contactInfo.addressLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal">
                Locatie
              </p>
              <div className="mt-4 overflow-hidden rounded-lg border border-charcoal/10">
                <iframe
                  title="Google Maps — Bliss Beauty by Norah"
                  src={contactMapsEmbedUrl}
                  className="h-64 w-full border-0 sm:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="mt-2 text-xs text-charcoal-soft/70">
                Speltstraat 28, 2400 Mol
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-charcoal/10 bg-cream-dark/40 p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal">
              Bericht sturen
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

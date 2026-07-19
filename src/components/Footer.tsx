import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { contactInfo } from "@/lib/contact";

const quickLinks = [
  { href: "/diensten", label: "Behandelingen" },
  { href: "/winkel", label: "Verzorgingsproducten" },
  { href: "/#over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-3">
          <div>
            <BrandMark nameClassName="text-2xl" taglineClassName="text-xl" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal-soft">
              Schoonheidsverzorging op afspraak. Een moment voor jezelf, met
              zorg en aandacht voor detail.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-charcoal-soft">
              <li>
                <a href={`mailto:${contactInfo.email}`} className="transition hover:text-charcoal">
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
              Snel naar
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-charcoal-soft transition hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Vervang door je echte Instagram-profiel. */}
            <a
              href="#"
              className="mt-4 inline-block text-sm text-charcoal-soft underline decoration-charcoal/30 underline-offset-4 transition hover:text-charcoal"
            >
              @jouw_instagram
            </a>
          </div>
        </div>

        <div className="mt-16 border-t border-charcoal/10 pt-6 text-xs text-charcoal-soft">
          &copy; {new Date().getFullYear()} Bliss — Beauty by Norah. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}

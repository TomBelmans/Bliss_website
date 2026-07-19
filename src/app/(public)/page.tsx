import { Suspense } from "react";
import Link from "next/link";
import { listActiveServices } from "@dal";
import { formatCents } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";
import { BrandMark } from "@/components/BrandMark";

/**
 * Pagina: /
 * Doel: Landing/homepage met hero, uitgelichte behandelingen, prijzenlijst,
 *       voorbeeldreviews en CTA’s naar boeken/diensten.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Service.id, Service.name, Service.description — via `listActiveServices` (FeaturedServices, max 3)
 * - Service.id, Service.name, Service.durationMinutes, Service.priceCents — via `listActiveServices` (PriceList)
 *
 * Acties / mutaties (via child components of API):
 * - (geen; alleen navigatielinks naar `/boeken`, `/diensten`, ankers)
 *
 * Lokale functies op deze pagina:
 * - `FeaturedServices`: toont max. 3 actieve diensten; leest Service via DAL
 * - `PriceList`: toont alle actieve diensten met duur/prijs; leest Service via DAL
 */
export const dynamic = "force-dynamic";

// Voorbeeldreviews — vervang door echte klantenervaringen voor je live gaat.
const reviews = [
  {
    quote:
      "Eindelijk een moment voor mezelf. De aandacht voor detail voelde je van begin tot einde.",
    name: "Emma V.",
  },
  {
    quote:
      "Rustige, verzorgde ruimte en een resultaat waar ik weken plezier van heb. Kom zeker terug.",
    name: "Sophie D.",
  },
  {
    quote:
      "Persoonlijk advies op maat van mijn huid, geen standaard verhaal. Precies wat ik zocht.",
    name: "Anna R.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-cream">
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-5 text-center">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-sand)_0%,_var(--color-cream-dark)_40%,_var(--color-cream)_70%)]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />

        <div className="relative mx-auto max-w-2xl">
          <div className="flex justify-center">
            <BrandMark
              nameClassName="text-sm font-medium tracking-[0.3em] text-gold"
              taglineClassName="mt-1 text-xl"
            />
          </div>
          <h1 className="mt-6 font-serif text-5xl italic leading-[1.1] text-charcoal sm:text-6xl">
            Rust voor de huid,
            <br />
            tijd voor jezelf.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-charcoal-soft">
            Schoonheidsverzorging op afspraak, met aandacht voor elk detail en
            advies op maat van jouw huid.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/boeken"
              className="rounded-full bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-cream transition hover:bg-gold-dark"
            >
              Boek een afspraak
            </Link>
            <Link
              href="#behandelingen"
              className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-soft underline decoration-charcoal/30 underline-offset-4 transition hover:text-charcoal"
            >
              Bekijk behandelingen
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Behandelingen ---------- */}
      <section id="behandelingen" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Onze zorg</p>
          <h2 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">
            Behandelingen op maat
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal-soft">
            Elke behandeling begint met luisteren: naar je huid en naar wat
            jij nodig hebt.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedServices />
        </Suspense>
      </section>

      {/* ---------- Voor & na ---------- */}
      <section className="border-y border-charcoal/10 bg-cream-dark">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Resultaat</p>
            <h2 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">Voor &amp; na</h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:gap-8">
            <div>
              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-sand to-cream" />
              <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-charcoal-soft">
                Voor
              </p>
            </div>
            <div>
              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-gold/40 to-cream" />
              <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-charcoal-soft">
                Na
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs italic text-charcoal-soft/70">
            Voorbeeldweergave — vervang door eigen voor- en na-foto's van behandelingen.
          </p>
        </div>
      </section>

      {/* ---------- Prijzen ---------- */}
      <section id="prijzen" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Tarieven</p>
          <h2 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">
            Eenvoudig en transparant
          </h2>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <PriceList />
        </Suspense>

        <div className="mt-14 text-center">
          <Link
            href="/boeken"
            className="rounded-full bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-cream transition hover:bg-gold-dark"
          >
            Boek een afspraak
          </Link>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="border-y border-charcoal/10 bg-cream-dark">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Ervaringen</p>
            <h2 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">
              Wat klanten zeggen
            </h2>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {reviews.map((review) => (
              <figure key={review.name} className="text-center">
                <blockquote className="font-serif text-lg italic leading-relaxed text-charcoal">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-charcoal-soft">
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Over ons ---------- */}
      <section id="over-ons" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 sm:grid-cols-2">
          <div className="aspect-[4/5] rounded-lg bg-[conic-gradient(from_120deg,_var(--color-cream-dark),_var(--color-sand),_var(--color-cream))] sm:order-2" />
          <div className="sm:order-1">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
              Over Bliss — Beauty by Norah
            </p>
            <h2 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">
              Zorg met aandacht
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-charcoal-soft">
              Bliss — Beauty by Norah ontstond vanuit een passie voor huidverzorging en het
              gevoel dat iedereen een moment van rust verdient. Elke
              behandeling wordt afgestemd op jouw huid, in een rustige
              omgeving en met tijd voor een goed gesprek.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="border-t border-charcoal/10 bg-cream-dark">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Volg ons</p>
            <h2 className="mt-4 font-serif text-3xl italic text-charcoal sm:text-4xl">
              @jouw_instagram
            </h2>
          </div>

          {/* Placeholder-grid — koppel hier een echte Instagram-feed via een
              gratis widget (bv. SnapWidget of Behold). */}
          <div className="mt-14 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{
                  background: `linear-gradient(${135 + i * 20}deg, var(--color-sand), var(--color-cream-dark))`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Slot-CTA ---------- */}
      <section className="bg-charcoal">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <h2 className="font-serif text-3xl italic text-cream sm:text-4xl">
            Klaar voor jouw moment van rust?
          </h2>
          <div className="mt-10">
            <Link
              href="/boeken"
              className="rounded-full bg-gold px-8 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-charcoal transition hover:bg-cream"
            >
              Boek nu een afspraak
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Uitgelichte behandelingen (max 3 actieve diensten) voor de home-sectie. */
async function FeaturedServices() {
  const services = (await listActiveServices()).slice(0, 3);
  if (services.length === 0) return null;

  return (
    <>
      <div className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="text-center">
            <div className="mx-auto h-40 w-40 rounded-full bg-[conic-gradient(from_180deg,_var(--color-sand),_var(--color-cream-dark),_var(--color-sand))]" />
            <h3 className="mt-6 font-serif text-xl text-charcoal">{service.name}</h3>
            {service.description && (
              <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                {service.description}
              </p>
            )}
            <Link
              href={`/diensten#${service.id}`}
              className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.15em] text-charcoal underline decoration-charcoal/30 underline-offset-4 transition hover:text-gold-dark"
            >
              Ontdek meer
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/diensten"
          className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-soft transition hover:text-charcoal"
        >
          Bekijk alle behandelingen &rarr;
        </Link>
      </div>
    </>
  );
}

/** Transparante prijzenlijst: alle actieve diensten met duur en prijs. */
async function PriceList() {
  const services = await listActiveServices();
  if (services.length === 0) return null;

  return (
    <div className="mt-14 divide-y divide-charcoal/10">
      {services.map((service) => (
        <div key={service.id} className="flex items-baseline justify-between gap-4 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-charcoal">{service.name}</span>
            <span className="text-xs text-charcoal-soft">{service.durationMinutes} min</span>
          </div>
          <span className="flex-1 -translate-y-1 border-b border-dotted border-charcoal/20" />
          <span className="font-medium text-charcoal">{formatCents(service.priceCents)}</span>
        </div>
      ))}
    </div>
  );
}

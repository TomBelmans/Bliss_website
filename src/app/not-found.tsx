import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pagina niet gevonden" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-rose-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
        Deze pagina bestaat niet (meer)
      </h1>
      <p className="mt-3 text-neutral-600">
        Misschien is de link verouderd, of typte je iets verkeerd. Probeer een
        van de onderstaande pagina&apos;s.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          Terug naar home
        </Link>
        <Link
          href="/boeken"
          className="rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-50"
        >
          Afspraak boeken
        </Link>
      </div>
    </div>
  );
}

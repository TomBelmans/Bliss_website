/**
 * Pagina: /admin/klanten
 * Doel: Geregistreerde klanten of gastklanten tonen, filteren en geo-stats.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Customer.firstName, lastName, email, city, country — via `listCustomers`
 * - Gast (Booking/Order zonder customerId): name, email, phone, bookingCount, orderCount, lastActivityAt — via `listGuestCustomers`
 * - Customer geo-counts (country/city) — via `getCustomerGeoStats`
 *
 * Acties / mutaties (via child components of forms):
 * - geen (filters via GET; koppelen gast op gast-detailpagina)
 *
 * searchParams:
 * - `type` (`geregistreerd`|`gasten`) — welk tabblad/lijst
 * - `naam`, `email` — filter beide lijsten
 * - `land`, `woonplaats` — alleen geregistreerde klanten
 *
 * Lokale functies op deze pagina:
 * - `CustomerAnalytics`: haalt geo-stats op via `getCustomerGeoStats`
 * - `GeoStatCard` / `CustomerFilterForm`: UI-helpers (geen fetch)
 * - `CustomerList`: Customer via `listCustomers`; filtert op searchParams
 * - `GuestList`: gasten via `listGuestCustomers`; filtert op naam/e-mail
 */
import { Suspense } from "react";
import Link from "next/link";
import { getCustomerGeoStats, listCustomers, listGuestCustomers } from "@dal";
import type { CustomerGeoCount } from "@models";
import { formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/custom/loading/loadingSpinner";

export const metadata = { title: "Klanten beheren" };

type SearchParams = Promise<{
  type?: string;
  naam?: string;
  email?: string;
  land?: string;
  woonplaats?: string;
}>;

export default async function AdminKlantenPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const type = params.type === "gasten" ? "gasten" : "geregistreerd";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Klanten</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Geregistreerde accounts en gastklanten (boekingen zonder account).
      </p>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/admin/klanten"
          className={`rounded-full px-3 py-1.5 ${
            type === "geregistreerd" ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-800"
          }`}
        >
          Geregistreerd
        </Link>
        <Link
          href="/admin/klanten?type=gasten"
          className={`rounded-full px-3 py-1.5 ${
            type === "gasten" ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-800"
          }`}
        >
          Gasten
        </Link>
      </div>

      {type === "geregistreerd" && (
        <Suspense fallback={<LoadingSpinner />}>
          <CustomerAnalytics />
        </Suspense>
      )}

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 rounded-lg border border-rose-100 bg-white p-4 lg:w-64">
          <h2 className="text-sm font-semibold text-neutral-900">Filter</h2>
          <CustomerFilterForm params={params} type={type} />
        </aside>

        <div className="min-w-0 flex-1">
          <Suspense
            key={`${type}-${params.naam ?? ""}-${params.email ?? ""}-${params.land ?? ""}-${params.woonplaats ?? ""}`}
            fallback={<LoadingSpinner />}
          >
            {type === "gasten" ? <GuestList params={params} /> : <CustomerList params={params} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** Haalt Customer-geo-aggregaties op via `getCustomerGeoStats` (per land/stad). */
async function CustomerAnalytics() {
  const stats = await getCustomerGeoStats();

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <GeoStatCard title="Klanten per land" items={stats.byCountry} empty="Nog geen klanten." />
      <GeoStatCard title="Klanten per stad" items={stats.byCity} empty="Nog geen klanten." />
    </div>
  );
}

function GeoStatCard({
  title,
  items,
  empty,
}: {
  title: string;
  items: CustomerGeoCount[];
  empty: string;
}) {
  const max = items.reduce((m, item) => Math.max(m, item.count), 0);

  return (
    <section className="rounded-lg border border-rose-100 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-neutral-800">{item.label}</span>
                <span className="shrink-0 font-medium text-rose-800">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-rose-50">
                <div
                  className="h-full rounded-full bg-rose-400"
                  style={{ width: `${max > 0 ? (item.count / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CustomerFilterForm({
  params,
  type,
}: {
  params: {
    naam?: string;
    email?: string;
    land?: string;
    woonplaats?: string;
  };
  type: "geregistreerd" | "gasten";
}) {
  const clearHref = type === "gasten" ? "/admin/klanten?type=gasten" : "/admin/klanten";

  return (
    <form method="get" className="mt-4 space-y-4">
      <input type="hidden" name="type" value={type} />
      <div>
        <label htmlFor="naam" className="block text-xs font-medium text-neutral-600">
          Naam
        </label>
        <input
          id="naam"
          name="naam"
          type="search"
          defaultValue={params.naam ?? ""}
          placeholder="Voor- of achternaam..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-neutral-600">
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="search"
          defaultValue={params.email ?? ""}
          placeholder="Zoek op e-mail..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {type === "geregistreerd" && (
        <>
          <div>
            <label htmlFor="land" className="block text-xs font-medium text-neutral-600">
              Land
            </label>
            <input
              id="land"
              name="land"
              type="search"
              defaultValue={params.land ?? ""}
              placeholder="Bv. België"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="woonplaats" className="block text-xs font-medium text-neutral-600">
              Woonplaats
            </label>
            <input
              id="woonplaats"
              name="woonplaats"
              type="search"
              defaultValue={params.woonplaats ?? ""}
              placeholder="Bv. Mol"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          className="w-full rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
        >
          Toepassen
        </button>
        {(params.naam || params.email || params.land || params.woonplaats) && (
          <Link
            href={clearHref}
            className="w-full rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Wis filters
          </Link>
        )}
      </div>
    </form>
  );
}

/** Haalt Customers op via `listCustomers` en filtert op naam/e-mail/land/woonplaats. */
async function CustomerList({
  params,
}: {
  params: {
    naam?: string;
    email?: string;
    land?: string;
    woonplaats?: string;
  };
}) {
  const customers = await listCustomers();
  const nameNeedle = params.naam?.trim().toLowerCase() ?? "";
  const emailNeedle = params.email?.trim().toLowerCase() ?? "";
  const countryNeedle = params.land?.trim().toLowerCase() ?? "";
  const cityNeedle = params.woonplaats?.trim().toLowerCase() ?? "";

  const filtered = customers.filter((customer) => {
    if (nameNeedle) {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      if (
        !fullName.includes(nameNeedle) &&
        !customer.firstName.toLowerCase().includes(nameNeedle) &&
        !customer.lastName.toLowerCase().includes(nameNeedle)
      ) {
        return false;
      }
    }
    if (emailNeedle && !customer.email.toLowerCase().includes(emailNeedle)) return false;
    if (countryNeedle && !customer.country.toLowerCase().includes(countryNeedle)) return false;
    if (cityNeedle && !customer.city.toLowerCase().includes(cityNeedle)) return false;
    return true;
  });

  const hasFilters = Boolean(nameNeedle || emailNeedle || countryNeedle || cityNeedle);

  return (
    <div className="divide-y divide-rose-100 rounded-lg border border-rose-100">
      {filtered.length === 0 && (
        <p className="p-4 text-sm text-neutral-500">
          {customers.length === 0
            ? "Nog geen geregistreerde klanten."
            : hasFilters
              ? "Geen klanten gevonden voor deze filters."
              : "Nog geen geregistreerde klanten."}
        </p>
      )}
      {filtered.map((customer) => (
        <Link
          key={customer.id}
          href={`/admin/klanten/${customer.id}`}
          className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-rose-50"
        >
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="truncate text-neutral-500">{customer.email}</p>
          </div>
          <p className="shrink-0 text-right text-neutral-500">
            {customer.city}
            <span className="block text-xs text-neutral-400">{customer.country}</span>
          </p>
        </Link>
      ))}
    </div>
  );
}

/**
 * Haalt gastklanten op via `listGuestCustomers` (geaggregeerd uit Booking/Order zonder account)
 * en filtert op naam/e-mail.
 */
async function GuestList({
  params,
}: {
  params: {
    naam?: string;
    email?: string;
  };
}) {
  const guests = await listGuestCustomers();
  const nameNeedle = params.naam?.trim().toLowerCase() ?? "";
  const emailNeedle = params.email?.trim().toLowerCase() ?? "";

  const filtered = guests.filter((guest) => {
    if (nameNeedle && !guest.name.toLowerCase().includes(nameNeedle)) return false;
    if (emailNeedle && !guest.email.toLowerCase().includes(emailNeedle)) return false;
    return true;
  });

  const hasFilters = Boolean(nameNeedle || emailNeedle);

  return (
    <div className="divide-y divide-rose-100 rounded-lg border border-rose-100">
      {filtered.length === 0 && (
        <p className="p-4 text-sm text-neutral-500">
          {guests.length === 0
            ? "Nog geen gastklanten."
            : hasFilters
              ? "Geen gasten gevonden voor deze filters."
              : "Nog geen gastklanten."}
        </p>
      )}
      {filtered.map((guest) => (
        <Link
          key={guest.email.toLowerCase()}
          href={`/admin/klanten/gast/${encodeURIComponent(guest.email)}`}
          className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-rose-50"
        >
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">
              {guest.name}
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                gast
              </span>
            </p>
            <p className="truncate text-neutral-500">{guest.email}</p>
            {guest.phone && <p className="text-neutral-500">{guest.phone}</p>}
          </div>
          <p className="shrink-0 text-right text-neutral-500">
            {guest.bookingCount} boeking{guest.bookingCount === 1 ? "" : "en"}
            {guest.orderCount > 0 && (
              <>
                <br />
                {guest.orderCount} bestelling{guest.orderCount === 1 ? "" : "en"}
              </>
            )}
            <span className="mt-1 block text-xs text-neutral-400">
              {formatDateTime(guest.lastActivityAt.toISOString())}
            </span>
          </p>
        </Link>
      ))}
    </div>
  );
}

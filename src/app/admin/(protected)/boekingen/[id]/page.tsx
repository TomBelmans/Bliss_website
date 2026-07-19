/**
 * Pagina: /admin/boekingen/[id]
 * Doel: Detail van één boeking tonen; annuleren indien niet geannuleerd.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Booking.serviceName, status, startsAt, endsAt, createdAt, customerName, customerEmail,
 *   customerPhone, customerId, notes — via `getBookingById`
 *
 * Acties / mutaties (via child components of forms):
 * - `cancelBooking` (DeleteButton) → DAL `cancelBooking` — Booking.status → CANCELLED
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingById } from "@dal";
import { formatDateTime, formatTime } from "@/lib/format";
import { bookingStatusLabels } from "@/lib/statusLabels";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DetailRow } from "@/components/admin/DetailRow";
import { cancelBooking } from "@actions";

export const metadata = { title: "Boeking" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BoekingDetailPage({ params }: Props) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const isPast = booking.startsAt.getTime() < Date.now();

  return (
    <div className="max-w-xl">
      <Link href="/admin/boekingen" className="text-sm text-rose-700 hover:underline">
        ← Terug naar boekingen
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{booking.serviceName}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {isPast ? "Afgelopen behandeling" : "Geplande behandeling"}
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {bookingStatusLabels[booking.status] ?? booking.status}
        </span>
      </div>

      <section className="mt-6 rounded-lg border border-rose-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Planning</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <DetailRow
            term="Datum & tijd"
            value={formatDateTime(booking.startsAt.toISOString())}
          />
          <DetailRow
            term="Einde (incl. opruimtijd)"
            value={`${formatTime(booking.endsAt.toISOString())} · ${formatDateTime(booking.endsAt.toISOString())}`}
          />
          <DetailRow
            term="Aangemaakt"
            value={formatDateTime(booking.createdAt.toISOString())}
          />
        </dl>
      </section>

      <section className="mt-4 rounded-lg border border-rose-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Klant</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <DetailRow term="Naam" value={booking.customerName} />
          <DetailRow term="E-mail" value={booking.customerEmail} />
          <DetailRow term="Telefoon" value={booking.customerPhone || "—"} />
          {booking.customerId ? (
            <div>
              <dt className="text-neutral-500">Account</dt>
              <dd className="text-neutral-900">
                <Link
                  href={`/admin/klanten/${booking.customerId}`}
                  className="text-rose-700 hover:underline"
                >
                  Bekijk klantprofiel
                </Link>
              </dd>
            </div>
          ) : (
            <DetailRow term="Account" value="Gastboeking (geen account)" />
          )}
        </dl>
      </section>

      {booking.notes ? (
        <section className="mt-4 rounded-lg border border-rose-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Opmerkingen</h2>
          <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{booking.notes}</p>
        </section>
      ) : null}

      {booking.status !== "CANCELLED" && (
        <div className="mt-8 border-t border-rose-100 pt-6">
          <DeleteButton
            action={cancelBooking.bind(null, { id: booking.id })}
            confirmText={`Boeking van ${booking.customerName} annuleren?`}
            label="Boeking annuleren"
          />
        </div>
      )}
    </div>
  );
}

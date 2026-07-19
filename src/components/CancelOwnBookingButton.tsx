/**
 * Annuleerknop voor eigen toekomstige afspraak op `/account`.
 * Hooks: `useTransition`, `useState` (fout); confirm via `window.confirm`.
 * Dataflow: klik → `cancelOwnBooking` action → DAL `updateBookingStatus`.
 */
"use client";

import { useState, useTransition } from "react";
import { cancelOwnBooking } from "@actions";

export function CancelOwnBookingButton({
  bookingId,
  serviceName,
}: {
  bookingId: string;
  serviceName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Wil je de afspraak "${serviceName}" echt annuleren?`)) return;

    setError(null);
    startTransition(async () => {
      try {
        await cancelOwnBooking({ id: bookingId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Annuleren is mislukt.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Bezig…" : "Annuleren"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

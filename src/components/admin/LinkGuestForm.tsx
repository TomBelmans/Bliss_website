"use client";

import { useState, useTransition } from "react";
import { linkGuestToCustomer } from "@actions";

type CustomerChoice = {
  id: string;
  label: string;
};

export function LinkGuestForm({
  guestEmail,
  customers,
}: {
  guestEmail: string;
  customers: CustomerChoice[];
}) {
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (customers.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Er zijn nog geen geregistreerde klanten om aan te koppelen.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!customerId) {
          setError("Kies een bestaande klant.");
          return;
        }
        setError(null);
        startTransition(async () => {
          try {
            await linkGuestToCustomer({ guestEmail, customerId });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Koppelen is mislukt.");
          }
        });
      }}
    >
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-neutral-700">
          Bestaande klant (leidend)
        </label>
        <select
          id="customerId"
          name="customerId"
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Kies een klant…</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-500">
          Naam, e-mail en telefoon van deze klant vervangen de gastgegevens op alle
          gekoppelde boekingen en bestellingen.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending || !customerId}
        className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
      >
        {pending ? "Bezig…" : "Koppelen aan klant"}
      </button>
    </form>
  );
}

/**
 * GDPR account-verwijderknop op `/account`.
 * Hooks: `useTransition`, `useState` (fout); confirm via `window.confirm`.
 * Dataflow: klik → `deleteOwnAccount` action → DAL `anonymizeCustomer` + redirect.
 */
"use client";

import { useState, useTransition } from "react";
import { deleteOwnAccount } from "@actions";

const CONFIRM_MESSAGE = [
  "Ben je zeker dat je je account wilt verwijderen?",
  "",
  "Je account wordt geanonimiseerd volgens de GDPR. Je kan niet meer inloggen. Je afspraken en",
  "bestellingen blijven bewaard voor de boekhouding, maar zonder jouw persoonsgegevens op het",
  "account. Dit kan niet ongedaan gemaakt worden.",
].join("\n");

export function DeleteAccountButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(CONFIRM_MESSAGE)) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteOwnAccount({});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verwijderen is mislukt.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Bezig…" : "Account verwijderen"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

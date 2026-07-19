/**
 * Klant-login op `/account`.
 * Hooks: `useState` (email/wachtwoord/fout), `useTransition`, `useRouter` (refresh).
 * Dataflow: form → `signInCustomer` action → sessiecookie → `router.refresh()`.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInCustomer } from "@actions";

export function AccountLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signInCustomer(email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="account-email" className="block text-sm font-medium text-neutral-700">
          E-mailadres
        </label>
        <input
          id="account-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="account-password" className="block text-sm font-medium text-neutral-700">
          Wachtwoord
        </label>
        <input
          id="account-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
      >
        {pending ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  );
}

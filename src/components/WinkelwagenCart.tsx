/**
 * Winkelwagen-UI + checkout.
 * Hooks: `useCart` (items/totalen), `useState` (loading/auth-velden).
 * Dataflow: cart-context → optioneel `registerCustomer`/`signInCustomer` →
 * POST `/api/checkout` (Stripe) met cartregels.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";
import { registerCustomer, signInCustomer } from "@actions";
import type { CustomerProfile } from "@models";
import { AddressFields } from "@/components/AddressFields";
import { PhoneField } from "@/components/PhoneField";
import { dialPrefix, isPhoneEmpty, resolveCallingInfo } from "@/lib/phone";

type AccountMode = "login" | "register";

export function WinkelwagenCart({ customerProfile }: { customerProfile: CustomerProfile | null }) {
  const { items, setQuantity, removeItem, totalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountMode, setAccountMode] = useState<AccountMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(() => dialPrefix(resolveCallingInfo("België").dial));
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("België");

  async function handleCheckout() {
    if (!customerProfile && accountMode === "register" && password !== passwordConfirmation) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Afrekenen kan alleen met een account: zonder bestaande sessie wordt
      // eerst ingelogd of geregistreerd (zet de sessie-cookie), pas daarna
      // wordt /api/checkout aangeroepen — die weigert anders met een 401.
      if (!customerProfile && accountMode === "login") {
        const result = await signInCustomer(email, password);
        if (!result.success) {
          throw new Error(result.error);
        }
      } else if (!customerProfile && accountMode === "register") {
        const result = await registerCustomer({
          email,
          password,
          firstName,
          lastName,
          phone: isPhoneEmpty(phone, country) ? undefined : phone.trim(),
          street,
          houseNumber,
          postalCode,
          city,
          country,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Afrekenen is mislukt.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Winkelwagen</h1>
        <p className="mt-3 text-neutral-600">Je winkelwagen is nog leeg.</p>
        <Link
          href="/winkel"
          className="mt-6 inline-block rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          Naar de winkel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">Winkelwagen</h1>

      <div className="mt-8 divide-y divide-rose-100 border-y border-rose-100">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-rose-50">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-neutral-900">{item.name}</p>
              <p className="text-sm text-neutral-500">{formatCents(item.priceCents)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-center"
            />
            <p className="w-20 text-right font-medium text-neutral-900">
              {formatCents(item.priceCents * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-neutral-400 hover:text-rose-700"
              aria-label={`${item.name} verwijderen`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-medium text-neutral-900">Totaal</span>
        <span className="text-lg font-semibold text-rose-800">{formatCents(totalCents)}</span>
      </div>

      {!customerProfile && (
        <div className="mt-8 space-y-4 border-t border-rose-100 pt-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Account</label>
            <p className="mt-1 text-xs text-neutral-500">
              Een account is nodig om af te rekenen — zo kan je nadien je bestellingen terugvinden.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["register", "Account aanmaken"],
                  ["login", "Inloggen"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAccountMode(mode)}
                  className={`rounded-md border px-2 py-2 text-xs font-medium sm:text-sm ${
                    accountMode === mode
                      ? "border-rose-700 bg-rose-700 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-rose-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {accountMode === "login" && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700">E-mailadres</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Wachtwoord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>
            </>
          )}

          {accountMode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Voornaam</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Achternaam</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">E-mailadres</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>
              <AddressFields
                value={{ street, houseNumber, postalCode, city, country }}
                onChange={(next) => {
                  setStreet(next.street);
                  setHouseNumber(next.houseNumber);
                  setPostalCode(next.postalCode);
                  setCity(next.city);
                  setCountry(next.country);
                }}
              />
              <PhoneField country={country} value={phone} onChange={setPhone} />
              <div>
                <label className="block text-sm font-medium text-neutral-700">Wachtwoord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Bevestig wachtwoord
                </label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
      >
        {loading ? "Bezig..." : "Afrekenen met Stripe"}
      </button>
    </div>
  );
}

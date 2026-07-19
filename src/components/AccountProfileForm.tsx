/**
 * Accountprofiel: weergave + bewerken.
 * Hooks: `useState` (velden/edit-modus), `useTransition` (submit), `useRouter` (refresh).
 * Dataflow: props `profile` → lokaal state → `updateOwnProfile` action → revalidate `/account`.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CustomerProfile } from "@models";
import { updateOwnProfile } from "@actions";
import { AddressFields } from "@/components/AddressFields";
import { PhoneField } from "@/components/PhoneField";
import { dialPrefix, isPhoneEmpty, resolveCallingInfo } from "@/lib/phone";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-neutral-900">{value || "—"}</dd>
    </div>
  );
}

export function AccountProfileForm({ profile }: { profile: CustomerProfile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(profile.email);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(
    profile.phone?.trim() || dialPrefix(resolveCallingInfo(profile.country || "België").dial)
  );
  const [street, setStreet] = useState(profile.street);
  const [houseNumber, setHouseNumber] = useState(profile.houseNumber);
  const [postalCode, setPostalCode] = useState(profile.postalCode);
  const [city, setCity] = useState(profile.city);
  const [country, setCountry] = useState(profile.country);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function resetFromProfile() {
    setEmail(profile.email);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(
      profile.phone?.trim() || dialPrefix(resolveCallingInfo(profile.country || "België").dial)
    );
    setStreet(profile.street);
    setHouseNumber(profile.houseNumber);
    setPostalCode(profile.postalCode);
    setCity(profile.city);
    setCountry(profile.country);
    setError(null);
    setSaved(false);
  }

  function startEditing() {
    resetFromProfile();
    setEditing(true);
  }

  function cancelEditing() {
    resetFromProfile();
    setEditing(false);
  }

  if (!editing) {
    const address = [street, houseNumber].filter(Boolean).join(" ");
    const locality = [postalCode, city].filter(Boolean).join(" ");

    return (
      <div className="mt-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProfileField label="Voornaam" value={profile.firstName} />
          <ProfileField label="Achternaam" value={profile.lastName} />
          <ProfileField label="E-mailadres" value={profile.email} />
          <ProfileField label="Telefoon" value={profile.phone?.trim() ?? ""} />
          <ProfileField label="Adres" value={address} />
          <ProfileField label="Postcode & gemeente" value={locality} />
          <ProfileField label="Land" value={profile.country} />
        </dl>

        <button
          type="button"
          onClick={startEditing}
          className="mt-6 rounded-full bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          Gegevens wijzigen
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        startTransition(async () => {
          try {
            await updateOwnProfile({
              email,
              firstName,
              lastName,
              phone: isPhoneEmpty(phone, country) ? "" : phone.trim(),
              street,
              houseNumber,
              postalCode,
              city,
              country,
            });
            setSaved(true);
            setEditing(false);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Opslaan is mislukt.");
          }
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Voornaam</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Achternaam</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">E-mailadres</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-700">Je gegevens zijn opgeslagen.</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
        >
          {pending ? "Bezig…" : "Wijzigingen opslaan"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={cancelEditing}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

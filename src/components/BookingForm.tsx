/**
 * Boekingsformulier (publiek + admin walk-in).
 * Hooks-overzicht: `useState` (dienst/datum/slot/klantvelden/auth), `useEffect`
 * (slots ophalen via `/api/availability`), `useMemo` (filters/afgeleiden).
 * Dataflow: slots API → keuze → optioneel `registerCustomer`/`signInCustomer` →
 * POST `/api/bookings` (DAL `createBooking`). Admin: bestaande klant selecteren.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import { MAX_DAYS_AHEAD } from "@/lib/business-hours";
import { registerCustomer, signInCustomer } from "@actions";
import type { CustomerProfile } from "@models";
import { AddressFields } from "@/components/AddressFields";
import { PhoneField } from "@/components/PhoneField";
import { dialPrefix, isPhoneEmpty, resolveCallingInfo } from "@/lib/phone";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

type AccountMode = "login" | "register";

export type CustomerOption = Pick<
  CustomerProfile,
  "id" | "firstName" | "lastName" | "email" | "phone"
>;

const EMPTY_CUSTOMERS: CustomerOption[] = [];

export function BookingForm({
  services,
  initialServiceId,
  customerProfile,
  hideAccountOptions = false,
  customers,
}: {
  services: Service[];
  initialServiceId?: string;
  customerProfile: CustomerProfile | null;
  /** Voor het admin-formulier (telefonische/walk-in boekingen): geen klantaccount-UI. */
  hideAccountOptions?: boolean;
  /** Enkel in het admin-formulier: bestaande klanten om de boeking aan te koppelen. */
  customers?: CustomerOption[];
}) {
  const initialService =
    services.find((s) => s.id === initialServiceId) ?? services[0];

  const [serviceId, setServiceId] = useState(initialService?.id ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [name, setName] = useState(
    customerProfile ? `${customerProfile.firstName} ${customerProfile.lastName}` : ""
  );
  const [email, setEmail] = useState(customerProfile?.email ?? "");
  const [phone, setPhone] = useState(() => dialPrefix(resolveCallingInfo("België").dial));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ startsAt: string } | null>(null);

  const [accountMode, setAccountMode] = useState<AccountMode>("register");
  const [sessionProfile, setSessionProfile] = useState<CustomerProfile | null>(customerProfile);
  const [customerSource, setCustomerSource] = useState<"existing" | "new">("new");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerListOpen, setCustomerListOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("België");

  const isAdminForm = hideAccountOptions;
  const existingCustomers = customers ?? EMPTY_CUSTOMERS;
  const selectedCustomerLocked = isAdminForm && customerSource === "existing" && !!selectedCustomerId;
  const needsPublicAuth = !isAdminForm && !sessionProfile;
  const readyToConfirm = isAdminForm || !!sessionProfile;

  const filteredCustomers = useMemo(() => {
    const needle = customerSearch.trim().toLocaleLowerCase("nl-BE");
    if (!needle) return existingCustomers;
    return existingCustomers.filter((c) =>
      c.lastName.toLocaleLowerCase("nl-BE").startsWith(needle)
    );
  }, [existingCustomers, customerSearch]);

  const selectedCustomerLabel = useMemo(() => {
    const customer = existingCustomers.find((c) => c.id === selectedCustomerId);
    if (!customer) return "";
    return `${customer.firstName} ${customer.lastName} (${customer.email})`;
  }, [existingCustomers, selectedCustomerId]);

  function selectCustomer(customer: CustomerOption) {
    setSelectedCustomerId(customer.id);
    setName(`${customer.firstName} ${customer.lastName}`);
    setEmail(customer.email);
    setPhone(customer.phone?.trim() || dialPrefix(resolveCallingInfo("België").dial));
    setCustomerSearch("");
    setCustomerListOpen(false);
  }

  function clearSelectedCustomer() {
    setSelectedCustomerId("");
    setName("");
    setEmail("");
    setPhone(dialPrefix(resolveCallingInfo("België").dial));
    setCustomerSearch("");
    setCustomerListOpen(true);
  }

  useEffect(() => {
    setSessionProfile(customerProfile);
  }, [customerProfile]);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDate = useMemo(
    () =>
      new Date(Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60_000).toISOString().slice(0, 10),
    []
  );

  useEffect(() => {
    setSelectedSlot(null);
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setError(null);
    fetch(`/api/availability?serviceId=${serviceId}&date=${date}`)
      .then((res) => res.json() as Promise<{ slots?: string[] }>)
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setError("Beschikbaarheid kon niet geladen worden."))
      .finally(() => setSlotsLoading(false));
  }, [serviceId, date]);

  async function handleAuthContinue(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot || sessionProfile) return;

    if (accountMode === "register" && password !== passwordConfirmation) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (accountMode === "login") {
        const result = await signInCustomer(email, password);
        if (!result.success) throw new Error(result.error);
        setSessionProfile(result.profile);
        setEmail(result.profile.email);
        setName(`${result.profile.firstName} ${result.profile.lastName}`);
      } else {
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
        if (!result.success) throw new Error(result.error);
        setSessionProfile(result.profile);
        setEmail(result.profile.email);
        setName(`${result.profile.firstName} ${result.profile.lastName}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmBooking(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;

    if (isAdminForm && customerSource === "existing" && !selectedCustomerId) {
      setError("Selecteer een bestaande klant of kies een nieuwe naam.");
      return;
    }

    if (!isAdminForm && !sessionProfile) {
      setError("Log eerst in of maak een account aan.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let bookingName: string;
      let bookingEmail: string;
      let bookingPhone: string;

      if (isAdminForm) {
        bookingName = name;
        bookingEmail = email;
        bookingPhone = phone;
      } else if (sessionProfile) {
        bookingName = `${sessionProfile.firstName} ${sessionProfile.lastName}`;
        bookingEmail = sessionProfile.email;
        const rawPhone: unknown = sessionProfile.phone;
        bookingPhone = typeof rawPhone === "string" ? rawPhone : "";
      } else {
        setError("Log eerst in of maak een account aan.");
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          startsAt: selectedSlot,
          customerName: bookingName,
          customerEmail: bookingEmail,
          customerPhone: bookingPhone,
          notes,
          ...(isAdminForm && selectedCustomerId ? { customerId: selectedCustomerId } : {}),
        }),
      });
      const data = (await res.json()) as { error?: string; booking?: { startsAt: string } };
      if (!res.ok || !data.booking) throw new Error(data.error ?? "Boeken is mislukt.");
      setEmail(bookingEmail);
      setConfirmed({ startsAt: data.booking.startsAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      if (serviceId && date) {
        const res = await fetch(`/api/availability?serviceId=${serviceId}&date=${date}`);
        const data = (await res.json()) as { slots?: string[] };
        setSlots(data.slots ?? []);
      }
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-rose-900">Afspraak bevestigd!</h2>
        <p className="mt-2 text-neutral-700">
          {formatDate(confirmed.startsAt)} om {formatTime(confirmed.startsAt)}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Je ontvangt een bevestiging op {email}.
        </p>
      </div>
    );
  }

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <form
      onSubmit={needsPublicAuth ? handleAuthContinue : handleConfirmBooking}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-neutral-700">Dienst</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} &middot; {s.durationMinutes} min &middot; {formatCents(s.priceCents)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Datum</label>
        <input
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      {date && (
        <div>
          <label className="block text-sm font-medium text-neutral-700">Beschikbare tijden</label>
          {slotsLoading && <p className="mt-2 text-sm text-neutral-500">Laden...</p>}
          {!slotsLoading && slots.length === 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              Geen beschikbare tijden op deze dag. Kies een andere datum.
            </p>
          )}
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-md border px-2 py-2 text-sm ${
                  selectedSlot === slot
                    ? "border-rose-700 bg-rose-700 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-rose-400"
                }`}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="space-y-4 border-t border-rose-100 pt-6">
          {needsPublicAuth && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Account</label>
                <p className="mt-1 text-xs text-neutral-500">
                  Een account is nodig om te boeken — zo kan je nadien je afspraken terugvinden.
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

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
              >
                {submitting ? "Bezig..." : "Doorgaan"}
              </button>
            </div>
          )}

          {readyToConfirm && (
            <>
              {sessionProfile && !isAdminForm && (
                <p className="text-sm text-neutral-700 font-bold">
                  U bent ingelogd als {" "}
                  <span>
                    {sessionProfile.firstName} {sessionProfile.lastName}
                  </span>{" "}
                  ({sessionProfile.email})
                </p>
              )}

              {isAdminForm && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Klant</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSource("existing");
                        setSelectedCustomerId("");
                        setCustomerSearch("");
                        setCustomerListOpen(true);
                        setName("");
                        setEmail("");
                      }}
                      className={`rounded-md border px-2 py-2 text-xs font-medium sm:text-sm ${
                        customerSource === "existing"
                          ? "border-rose-700 bg-rose-700 text-white"
                          : "border-neutral-300 text-neutral-700 hover:border-rose-400"
                      }`}
                    >
                      Bestaande klant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSource("new");
                        setSelectedCustomerId("");
                        setCustomerSearch("");
                        setCustomerListOpen(false);
                      }}
                      className={`rounded-md border px-2 py-2 text-xs font-medium sm:text-sm ${
                        customerSource === "new"
                          ? "border-rose-700 bg-rose-700 text-white"
                          : "border-neutral-300 text-neutral-700 hover:border-rose-400"
                      }`}
                    >
                      Nieuwe naam invoeren
                    </button>
                  </div>

                  {customerSource === "existing" && (
                    <div className="mt-3">
                      {existingCustomers.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                          Nog geen klantaccounts. Kies &quot;Nieuwe naam invoeren&quot;.
                        </p>
                      ) : (
                        <div className="relative">
                          {selectedCustomerId ? (
                            <div className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm">
                              <span className="min-w-0 flex-1 truncate">{selectedCustomerLabel}</span>
                              <button
                                type="button"
                                onClick={clearSelectedCustomer}
                                className="shrink-0 text-xs font-medium text-rose-700 hover:underline"
                              >
                                Wijzig
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="search"
                                value={customerSearch}
                                onChange={(e) => {
                                  setCustomerSearch(e.target.value);
                                  setCustomerListOpen(true);
                                }}
                                onFocus={() => setCustomerListOpen(true)}
                                placeholder="Zoek op achternaam (bv. K)…"
                                autoComplete="off"
                                className="w-full rounded-md border border-neutral-300 px-3 py-2"
                              />
                              {customerListOpen && (
                                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-neutral-200 bg-white shadow-md">
                                  {filteredCustomers.length === 0 ? (
                                    <li className="px-3 py-2 text-sm text-neutral-500">
                                      Geen klanten met achternaam beginnend op &quot;
                                      {customerSearch.trim() || "…"}&quot;
                                    </li>
                                  ) : (
                                    filteredCustomers.map((c) => (
                                      <li key={c.id}>
                                        <button
                                          type="button"
                                          onClick={() => selectCustomer(c)}
                                          className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-rose-50"
                                        >
                                          <span className="font-medium text-neutral-900">
                                            {c.lastName}, {c.firstName}
                                          </span>
                                          <span className="text-xs text-neutral-500">{c.email}</span>
                                        </button>
                                      </li>
                                    ))
                                  )}
                                </ul>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isAdminForm && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Naam</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      readOnly={selectedCustomerLocked}
                      className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 read-only:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">E-mailadres</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={selectedCustomerLocked}
                      className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 read-only:bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Telefoonnummer (optioneel)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      readOnly={selectedCustomerLocked}
                      className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 read-only:bg-neutral-50"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Opmerkingen (optioneel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
              >
                {submitting
                  ? "Bezig..."
                  : `Bevestig afspraak${selectedService ? ` — ${formatCents(selectedService.priceCents)}` : ""}`}
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}

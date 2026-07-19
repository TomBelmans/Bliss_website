"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { AddressSuggestion, AddressValue } from "@/lib/address";

export type { AddressValue };

type AddressFieldsProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

/**
 * Adresvelden met autocomplete op het straatveld (Photon / OpenStreetMap).
 * Bij keuze van een voorstel worden straat, nr., postcode, gemeente en land ingevuld.
 */
export function AddressFields({ value, onChange }: AddressFieldsProps) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSearch = useRef(false);

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }

    const q = value.street.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = setTimeout(() => {
      fetch(`/api/address-search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json() as Promise<{ suggestions?: AddressSuggestion[] }>)
        .then((data) => {
          setSuggestions(data.suggestions ?? []);
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [value.street]);

  function selectSuggestion(suggestion: AddressSuggestion) {
    skipSearch.current = true;
    onChange({
      street: suggestion.street,
      houseNumber: suggestion.houseNumber,
      postalCode: suggestion.postalCode,
      city: suggestion.city,
      country: suggestion.country || "België",
    });
    setSuggestions([]);
    setOpen(false);
  }

  function updateField<K extends keyof AddressValue>(key: K, fieldValue: AddressValue[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Straat</label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => {
              updateField("street", e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (blurTimer.current) clearTimeout(blurTimer.current);
              if (suggestions.length > 0) setOpen(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 150);
            }}
            placeholder="Geef een adres in"
            autoComplete="street-address"
            required
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Typ een adres; kies een voorstel om de velden in te vullen.
            {loading ? " Zoeken…" : ""}
          </p>

          {open && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-neutral-200 bg-white shadow-md"
            >
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-rose-50"
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Nr.</label>
          <input
            type="text"
            value={value.houseNumber}
            onChange={(e) => updateField("houseNumber", e.target.value)}
            required
            autoComplete="address-line2"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Postcode</label>
          <input
            type="text"
            value={value.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            required
            autoComplete="postal-code"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Gemeente</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => updateField("city", e.target.value)}
            required
            autoComplete="address-level2"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Land</label>
        <input
          type="text"
          value={value.country}
          onChange={(e) => updateField("country", e.target.value)}
          required
          autoComplete="country-name"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <p className="text-xs text-neutral-400">Adresvoorstellen via OpenStreetMap (Photon).</p>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CreateAttributeResult } from "@actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type EntityOption = { id: string; name: string };

/**
 * Enkelvoudige dropdown-selectie + inline een nieuwe optie aanmaken. Net als
 * CategoryPicker's hidden JSON-veld leunt dit op het `name`-attribuut van
 * het native <select>-element, zodat de gekozen waarde gewoon meereist in de
 * FormData bij het versturen van het omliggende formulier — geen
 * react-hook-form-registratie nodig.
 */
export function EntitySelect({
  fieldName,
  label,
  emptyOptionLabel,
  newPlaceholder,
  allOptions,
  initialSelectedId,
  onCreate,
}: {
  fieldName: string;
  label: string;
  emptyOptionLabel: string;
  newPlaceholder: string;
  allOptions: EntityOption[];
  initialSelectedId: string | null;
  onCreate: (name: string) => Promise<CreateAttributeResult>;
}) {
  const router = useRouter();
  const [options, setOptions] = useState(allOptions);
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? "");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    const name = newName.trim();
    if (!name || pending) return;
    setError(null);

    startTransition(async () => {
      const result = await onCreate(name);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOptions((current) =>
        [...current.filter((option) => option.id !== result.id), { id: result.id, name: result.name }].sort(
          (a, b) => a.name.localeCompare(b.name, "nl-BE")
        )
      );
      setSelectedId(result.id);
      setNewName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <select
        id={fieldName}
        name={fieldName}
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        )}
      >
        <option value="">{emptyOptionLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            // Enter maakt de optie aan i.p.v. het hele formulier op te slaan.
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder={newPlaceholder}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending || !newName.trim()}
          className="shrink-0 rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
        >
          {pending ? "Bezig…" : "Toevoegen"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

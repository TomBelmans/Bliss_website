"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CreateCategoryResult } from "@actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CategoryOption = { id: string; name: string };

/**
 * Meerdere categorieën aanvinken + inline een nieuwe aanmaken. De selectie
 * reist als één JSON-hidden-veld (`categoryIds`) mee met de omliggende
 * form-submit; het aanmaken van een categorie gebeurt los daarvan via de
 * meegegeven server action, zodat de nieuwe meteen aangevinkt kan worden.
 */
export function CategoryPicker({
  allCategories,
  initialSelectedIds,
  onCreateCategory,
}: {
  allCategories: CategoryOption[];
  initialSelectedIds: string[];
  onCreateCategory: (name: string) => Promise<CreateCategoryResult>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(allCategories);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]
    );
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name || pending) return;
    setError(null);

    startTransition(async () => {
      const result = await onCreateCategory(name);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCategories((current) =>
        [...current.filter((c) => c.id !== result.id), { id: result.id, name: result.name }].sort(
          (a, b) => a.name.localeCompare(b.name, "nl-BE")
        )
      );
      setSelectedIds((current) => [...current, result.id]);
      setNewName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Label>Categorieën</Label>
      <input type="hidden" name="categoryIds" value={JSON.stringify(selectedIds)} />

      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nog geen categorieën — maak er hieronder één aan.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 has-[:checked]:border-rose-700 has-[:checked]:bg-rose-50 has-[:checked]:text-rose-900"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(category.id)}
                onChange={() => toggle(category.id)}
                className="h-4 w-4 accent-rose-700"
              />
              {category.name}
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            // Enter maakt de categorie aan i.p.v. het hele formulier op te slaan.
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder="Nieuwe categorie…"
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

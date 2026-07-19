/**
 * Knop “in winkelwagen” op productdetail.
 * Hooks: `useCart().addItem`, `useState` (feedback “toegevoegd”).
 * Dataflow: productprops → cart-context (localStorage); geen server call.
 */
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export function AddToCartButton({
  productId,
  name,
  priceCents,
  imageUrl,
  inStock,
}: {
  productId: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  inStock: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500"
      >
        Uitverkocht
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, name, priceCents, imageUrl });
        setAdded(true);
      }}
      className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
    >
      {added ? "Toegevoegd ✓" : "Toevoegen aan winkelwagen"}
    </button>
  );
}

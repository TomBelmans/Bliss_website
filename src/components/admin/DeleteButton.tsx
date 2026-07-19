"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  confirmText,
  label = "Verwijderen",
}: {
  action: () => Promise<void>;
  confirmText: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) {
          startTransition(async () => {
            await action();
          });
        }
      }}
      className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Bezig..." : label}
    </button>
  );
}

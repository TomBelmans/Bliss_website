"use client";

import { useTransition } from "react";
import { signOutCustomer } from "@actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutCustomer())}
      className="text-sm font-medium text-neutral-500 underline transition hover:text-rose-700 disabled:opacity-60"
    >
      Uitloggen
    </button>
  );
}

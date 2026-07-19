"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ServerFunctionResponse } from "@models";
import { submitContactForm } from "@actions";

const initialState: ServerFunctionResponse = { success: false };

export function ContactForm() {
  const [serverResponse, formAction, pending] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (serverResponse.success) formRef.current?.reset();
  }, [serverResponse.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Naam
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {serverResponse.errors?.name?.[0] && (
          <p className="mt-1 text-sm text-red-600">{serverResponse.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {serverResponse.errors?.email?.[0] && (
          <p className="mt-1 text-sm text-red-600">{serverResponse.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
          Telefoon (optioneel)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-neutral-700">
          Bericht
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {serverResponse.errors?.message?.[0] && (
          <p className="mt-1 text-sm text-red-600">{serverResponse.errors.message[0]}</p>
        )}
      </div>

      {serverResponse.errors?.errors && (
        <p className="text-sm text-red-600">{serverResponse.errors.errors[0]}</p>
      )}

      {serverResponse.success && (
        <p className="rounded-md border border-gold/40 bg-cream-dark px-3 py-2 text-sm text-charcoal">
          Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {pending ? "Versturen…" : "Verstuur bericht"}
      </button>
    </form>
  );
}

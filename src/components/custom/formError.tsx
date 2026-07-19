import type { FunctionComponent } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";
import type { ServerFunctionResponse } from "@models";

interface FormErrorProps {
  path: string;
  formErrors: FieldErrors<FieldValues>;
  serverErrors?: ServerFunctionResponse;
}

/** Toont client-side (react-hook-form) én server-side validatiefouten voor één veld. */
const FormError: FunctionComponent<FormErrorProps> = ({ path, formErrors, serverErrors }) => {
  const formError = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), formErrors) as
    | { message?: string }
    | undefined;

  const serverError = Array.from(new Set(serverErrors?.errors?.[path.split(".")[0]] ?? []));

  const message = formError?.message ?? serverError[0];
  if (!message) return null;

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
};

export default FormError;

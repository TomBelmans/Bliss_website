"use client";

import { useActionState } from "react";
import type { OrderStatus } from "@/generated/prisma/client";
import type { ServerFunctionResponse } from "@models";
import SubmitButtonWithLoading from "@/components/custom/submitButtonWithLoading";

type FormAction = (
  prevState: ServerFunctionResponse,
  formData: FormData
) => Promise<ServerFunctionResponse>;

const initialState: ServerFunctionResponse = { success: false };

const statusOptions: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];

export function OrderStatusForm({
  currentStatus,
  action,
}: {
  currentStatus: OrderStatus;
  action: FormAction;
}) {
  const [serverResponse, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-2 flex items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <SubmitButtonWithLoading text="Opslaan" loadingText="Bezig…" />
      {serverResponse.success && <span className="text-sm text-green-600">Opgeslagen.</span>}
    </form>
  );
}

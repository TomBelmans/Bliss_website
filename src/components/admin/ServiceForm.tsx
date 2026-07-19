"use client";

import { useActionState } from "react";
import type { ServiceCategory } from "@/generated/prisma/client";
import type { ServerFunctionResponse, ServiceWithCategories } from "@models";
import { serviceFormSchema } from "@schemas";
import { createServiceCategory } from "@actions";
import { useZodValidatedForm } from "@hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormError from "@/components/custom/formError";
import SubmitButtonWithLoading from "@/components/custom/submitButtonWithLoading";
import Form from "@/components/custom/form";
import { CategoryPicker } from "@/components/admin/CategoryPicker";

type FormAction = (
  prevState: ServerFunctionResponse,
  formData: FormData
) => Promise<ServerFunctionResponse>;

const initialState: ServerFunctionResponse = { success: false };

export function ServiceForm({
  service,
  allCategories,
  action,
}: {
  service?: ServiceWithCategories;
  allCategories: ServiceCategory[];
  action: FormAction;
}) {
  const [serverResponse, formAction] = useActionState(action, initialState);
  const form = useZodValidatedForm(serviceFormSchema, {
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      durationMinutes: service?.durationMinutes ?? 30,
      price: service ? service.priceCents / 100 : 0,
      active: service?.active ?? true,
    },
  });

  return (
    <Form action={formAction} hookForm={form} className="space-y-4">
      <div>
        <Label htmlFor="name">Naam</Label>
        <Input id="name" {...form.register("name")} />
        <FormError path="name" formErrors={form.formState.errors} serverErrors={serverResponse} />
      </div>
      <CategoryPicker
        allCategories={allCategories}
        initialSelectedIds={service?.categories.map((category) => category.id) ?? []}
        onCreateCategory={createServiceCategory}
      />
      <div>
        <Label htmlFor="description">Beschrijving</Label>
        <Textarea id="description" rows={3} {...form.register("description")} />
        <FormError path="description" formErrors={form.formState.errors} serverErrors={serverResponse} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="durationMinutes">Duur (minuten)</Label>
          <Input id="durationMinutes" type="number" min={1} {...form.register("durationMinutes")} />
          <FormError
            path="durationMinutes"
            formErrors={form.formState.errors}
            serverErrors={serverResponse}
          />
        </div>
        <div>
          <Label htmlFor="price">Prijs (EUR)</Label>
          <Input id="price" type="number" step="0.01" min={0} {...form.register("price")} />
          <FormError path="price" formErrors={form.formState.errors} serverErrors={serverResponse} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="active" defaultChecked={service?.active ?? true} />
        Actief (zichtbaar op de site)
      </label>

      {serverResponse.errors?.errors && (
        <p className="text-sm text-red-600">{serverResponse.errors.errors[0]}</p>
      )}

      <SubmitButtonWithLoading
        text={service ? "Wijzigingen opslaan" : "Dienst aanmaken"}
        loadingText="Bezig…"
      />
    </Form>
  );
}

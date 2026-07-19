"use client";

import { useActionState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButtonWithLoading from "@/components/custom/submitButtonWithLoading";
import FormError from "@/components/custom/formError";
import Form from "@/components/custom/form";
import { useZodValidatedForm } from "@hooks";
import { changePasswordSchema } from "@schemas";
import { changePassword } from "@actions";
import type { Profile, ServerFunctionResponse } from "@models";

const initialState: ServerFunctionResponse = { success: false };

export function AccountForm({ email }: Profile) {
  const [serverResponse, formAction] = useActionState(changePassword, initialState);
  const form = useZodValidatedForm(changePasswordSchema);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <h1 className="text-xl font-semibold">Mijn account</h1>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>

        <Form action={formAction} hookForm={form} className="mt-6 space-y-4">
          <h2 className="text-sm font-medium">Wachtwoord wijzigen</h2>
          <div>
            <Label htmlFor="currentPassword">Huidig wachtwoord</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...form.register("currentPassword")}
            />
            <FormError
              path="currentPassword"
              formErrors={form.formState.errors}
              serverErrors={serverResponse}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...form.register("newPassword")}
            />
            <FormError path="newPassword" formErrors={form.formState.errors} serverErrors={serverResponse} />
          </div>
          <div>
            <Label htmlFor="newPasswordConfirmation">Bevestig nieuw wachtwoord</Label>
            <Input
              id="newPasswordConfirmation"
              type="password"
              autoComplete="new-password"
              {...form.register("newPasswordConfirmation")}
            />
            <FormError
              path="newPasswordConfirmation"
              formErrors={form.formState.errors}
              serverErrors={serverResponse}
            />
          </div>

          {serverResponse.success && (
            <p className="text-sm text-green-600">Wachtwoord gewijzigd.</p>
          )}
          {serverResponse.errors?.errors && (
            <p className="text-sm text-red-600">{serverResponse.errors.errors[0]}</p>
          )}

          <SubmitButtonWithLoading text="Wachtwoord wijzigen" loadingText="Bezig…" className="w-full" />
        </Form>
      </CardContent>
    </Card>
  );
}

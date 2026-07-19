"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButtonWithLoading from "@/components/custom/submitButtonWithLoading";
import FormError from "@/components/custom/formError";
import Form from "@/components/custom/form";
import { useZodValidatedForm } from "@hooks";
import { signInSchema } from "@schemas";
import { signIn } from "@actions";
import type { ServerFunctionResponse } from "@models";

const initialState: ServerFunctionResponse = { success: false };

export function AuthForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [serverResponse, formAction] = useActionState(signIn, initialState);
  const form = useZodValidatedForm(signInSchema);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <h1 className="text-xl font-semibold">Inloggen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Beheerdersomgeving van Bliss — Beauty by Norah.
          </p>

          <Form action={formAction} hookForm={form} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <Label htmlFor="email">E-mailadres</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              <FormError path="email" formErrors={form.formState.errors} serverErrors={serverResponse} />
            </div>
            <div>
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              <FormError path="password" formErrors={form.formState.errors} serverErrors={serverResponse} />
            </div>

            {serverResponse.errors?.errors && (
              <p className="text-sm text-red-600">{serverResponse.errors.errors[0]}</p>
            )}

            <SubmitButtonWithLoading text="Inloggen" loadingText="Bezig…" className="w-full" />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

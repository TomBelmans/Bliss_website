/**
 * Admin productformulier (nieuw/bewerken).
 * Hooks: `useActionState` (server action), `useZodValidatedForm` (client-validatie).
 * Dataflow: velden → gebonden `createProduct`/`updateProduct` action → DAL;
 * inline `createProductCategory` / `createBrand` / `createContentUnit` voor nieuwe opties.
 */
"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { ProductCategory, Brand, ContentUnit } from "@/generated/prisma/client";
import type { ProductWithCategories, ServerFunctionResponse } from "@models";
import { productFormSchema } from "@schemas";
import { createProductCategory, createBrand, createContentUnit } from "@actions";
import { useZodValidatedForm } from "@hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormError from "@/components/custom/formError";
import SubmitButtonWithLoading from "@/components/custom/submitButtonWithLoading";
import Form from "@/components/custom/form";
import { CategoryPicker } from "@/components/admin/CategoryPicker";
import { EntitySelect } from "@/components/admin/EntitySelect";

type FormAction = (
  prevState: ServerFunctionResponse,
  formData: FormData
) => Promise<ServerFunctionResponse>;

const initialState: ServerFunctionResponse = { success: false };

export function ProductForm({
  product,
  allCategories,
  allBrands,
  allContentUnits,
  action,
}: {
  product?: ProductWithCategories;
  allCategories: ProductCategory[];
  allBrands: Brand[];
  allContentUnits: ContentUnit[];
  action: FormAction;
}) {
  const [serverResponse, formAction] = useActionState(action, initialState);
  const form = useZodValidatedForm(productFormSchema, {
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? product.priceCents / 100 : 0,
      stockQuantity: product?.stockQuantity ?? 0,
      volume: product?.volume ?? undefined,
      active: product?.active ?? true,
    },
  });

  const imageUrl = product?.imageMimeType ? `/api/products/${product.id}/image` : null;

  return (
    <Form action={formAction} hookForm={form} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" {...form.register("name")} />
        <FormError path="name" formErrors={form.formState.errors} serverErrors={serverResponse} />
      </div>
      <CategoryPicker
        allCategories={allCategories}
        initialSelectedIds={product?.categories.map((category) => category.id) ?? []}
        onCreateCategory={createProductCategory}
      />
      <div className="space-y-2">
        <Label htmlFor="description">Beschrijving</Label>
        <Textarea id="description" rows={3} {...form.register("description")} />
        <FormError path="description" formErrors={form.formState.errors} serverErrors={serverResponse} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prijs (EUR)</Label>
          <Input id="price" type="number" step="0.01" min={0} {...form.register("price")} />
          <FormError path="price" formErrors={form.formState.errors} serverErrors={serverResponse} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Voorraad</Label>
          <Input id="stockQuantity" type="number" min={0} {...form.register("stockQuantity")} />
          <FormError
            path="stockQuantity"
            formErrors={form.formState.errors}
            serverErrors={serverResponse}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <EntitySelect
          fieldName="brandId"
          label="Merk"
          emptyOptionLabel="Geen merk"
          newPlaceholder="Nieuw merk…"
          allOptions={allBrands}
          initialSelectedId={product?.brand?.id ?? null}
          onCreate={createBrand}
        />
        <EntitySelect
          fieldName="contentUnitId"
          label="Inhoudseenheid"
          emptyOptionLabel="Geen eenheid"
          newPlaceholder="Nieuwe eenheid…"
          allOptions={allContentUnits}
          initialSelectedId={product?.contentUnit?.id ?? null}
          onCreate={createContentUnit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="volume">Volume (optioneel, bv. 50 bij 50 ml)</Label>
        <Input id="volume" type="number" step="0.01" min={0} {...form.register("volume")} />
        <FormError path="volume" formErrors={form.formState.errors} serverErrors={serverResponse} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Foto</Label>
        {imageUrl && (
          <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-neutral-100">
            <Image src={imageUrl} alt={product?.name ?? ""} fill className="object-cover" />
          </div>
        )}
        <input
          id="image"
          type="file"
          name="image"
          accept="image/*"
          className="block w-full text-sm text-neutral-600"
        />
        <p className="text-xs text-neutral-400">
          {imageUrl
            ? "Laat leeg om de huidige foto te behouden."
            : "Optioneel, kan later toegevoegd worden."}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
        Actief (zichtbaar in de winkel)
      </label>

      {serverResponse.errors?.errors && (
        <p className="text-sm text-red-600">{serverResponse.errors.errors[0]}</p>
      )}

      <SubmitButtonWithLoading
        text={product ? "Wijzigingen opslaan" : "Product aanmaken"}
        loadingText="Bezig…"
      />
    </Form>
  );
}

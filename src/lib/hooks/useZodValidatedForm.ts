import { useForm, type FieldValues, type Resolver, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Dunne wrapper rond `useForm` die automatisch de Zod-resolver koppelt.
 *
 * De cast hieronder is nodig omdat Zod 4's dubbele (input/output) generics
 * niet één-op-één passen op react-hook-form's `Resolver`-type bij een
 * generieke doorgeef-functie zoals deze — de resolver zelf werkt gewoon
 * correct at runtime voor elk schema dat naar `TFieldValues` valideert.
 */
export function useZodValidatedForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
  props?: UseFormProps<TFieldValues>
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema as z.ZodType<TFieldValues, TFieldValues>) as Resolver<TFieldValues>,
    ...props,
  });
}

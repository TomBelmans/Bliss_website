import type { z, ZodSchema } from "zod";
import type { CustomerProfile, Profile, ServerFunctionResponse, ValidationErrors } from "@models";
import { getSessionProfileAndOptionallyExtend } from "./sessionMediators";
import { getCustomerProfileAndOptionallyExtend } from "./customerSessionMediators";
import { convertFormData } from "@serverUtils";

type PublicAction<T extends ZodSchema> = (
  validatedData: z.infer<T>,
  formData?: FormData
) => Promise<ServerFunctionResponse | void>;
type ProtectedAction<T extends ZodSchema, P> = (
  validatedData: z.infer<T>,
  profile: P,
  // Enkel ingevuld bij een `<form>`-actie. Bedoeld voor de zeldzame gevallen
  // waar je bij de ruwe FormData moet kunnen (bv. een geüploade foto), die
  // niet via het Zod-schema loopt.
  formData?: FormData
) => Promise<ServerFunctionResponse | void>;

type FormAction = (
  prevState: ServerFunctionResponse,
  formData: FormData
) => Promise<ServerFunctionResponse>;
type ServerFunction<T extends ZodSchema> = (data: z.infer<T>) => Promise<void>;

type ValidationResult<T> = { data: null; errors: ValidationErrors } | { data: T; errors: null };

/**
 * Herkent de speciale error die `redirect()`/`notFound()` intern gooien,
 * zonder afhankelijk te zijn van niet-publieke Next.js-interne imports.
 * Zo'n error moet altijd doorgegooid worden, nooit opgevangen.
 */
function isNextNavigationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  const { digest } = error;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND");
}

/**
 * Wrapt een server action met Zod-validatie, sessie-check en consistente
 * foutafhandeling, klaar om aan `useActionState` door te geven. Vereist
 * altijd een ingelogde beheerder — gebruik `publicFormAction` voor de
 * uitzonderingen (enkel inloggen) die dat niet mogen vereisen, of
 * `customerFormAction` voor een actie die een ingelogde klant vereist
 * i.p.v. een beheerder.
 *
 * Let op: we bepalen bewust NIET via het aantal parameters van `fn` of
 * authenticatie vereist is (zoals sommige vergelijkbare patronen doen) —
 * dat is fragiel bij destructured parameters (`{id}` telt ook als 1
 * parameter) en zou een vergeten `profile`-argument stilzwijgend in een
 * onbeveiligde actie kunnen veranderen.
 */
export function formAction<T extends ZodSchema>(schema: T, fn: ProtectedAction<T, Profile>): FormAction {
  return async (_prevState: ServerFunctionResponse, unvalidatedData: FormData) =>
    handleServerFunction(schema, unvalidatedData, fn, getSessionProfileAndOptionallyExtend);
}

/** Zelfde als `formAction`, maar voor aanroepen met een gewoon object i.p.v. een `<form>`. */
export function serverFunction<T extends ZodSchema>(schema: T, fn: ProtectedAction<T, Profile>): ServerFunction<T> {
  return async (unvalidatedData: z.infer<T>): Promise<void> => {
    const result = await handleServerFunction(schema, unvalidatedData, fn, getSessionProfileAndOptionallyExtend);
    if (!result.success) {
      throw new Error("Error in a serverFunction", { cause: result.errors });
    }
  };
}

/** Zoals `serverFunction`, maar vereist een ingelogde klant i.p.v. een beheerder. */
export function customerServerFunction<T extends ZodSchema>(
  schema: T,
  fn: ProtectedAction<T, CustomerProfile>
): ServerFunction<T> {
  return async (unvalidatedData: z.infer<T>): Promise<void> => {
    const result = await handleServerFunction(
      schema,
      unvalidatedData,
      fn,
      getCustomerProfileAndOptionallyExtend
    );
    if (!result.success) {
      const message =
        result.errors?.errors?.[0] ??
        Object.values(result.errors ?? {}).flat()[0] ??
        "Er ging iets mis.";
      throw new Error(typeof message === "string" ? message : "Er ging iets mis.");
    }
  };
}

/** Zoals `formAction`, maar zonder sessie-vereiste. Enkel voor bv. de inlogpagina. */
export function publicFormAction<T extends ZodSchema>(schema: T, fn: PublicAction<T>): FormAction {
  return async (_prevState: ServerFunctionResponse, unvalidatedData: FormData) =>
    handleServerFunction(schema, unvalidatedData, fn, null);
}

/** Zoals `formAction`, maar vereist een ingelogde klant i.p.v. een beheerder. */
export function customerFormAction<T extends ZodSchema>(
  schema: T,
  fn: ProtectedAction<T, CustomerProfile>
): FormAction {
  return async (_prevState: ServerFunctionResponse, unvalidatedData: FormData) =>
    handleServerFunction(schema, unvalidatedData, fn, getCustomerProfileAndOptionallyExtend);
}

/** Alias van `publicFormAction`, voor duidelijkheid op de aanroepplekken in de klant-flows. */
export const publicCustomerFormAction = publicFormAction;

async function handleServerFunction<T extends ZodSchema, P>(
  schema: T,
  unvalidatedData: unknown,
  fn: ProtectedAction<T, P> | PublicAction<T>,
  getProfile: (() => Promise<P>) | null
): Promise<ServerFunctionResponse> {
  try {
    const profile = getProfile ? await getProfile() : undefined;

    const { data, errors } = validateSchema(schema, unvalidatedData);
    if (errors) {
      return {
        errors,
        success: false,
        submittedData: (unvalidatedData instanceof FormData
          ? Object.fromEntries(unvalidatedData.entries())
          : unvalidatedData) as Record<string, string>,
      };
    }

    const rawFormData = unvalidatedData instanceof FormData ? unvalidatedData : undefined;

    // Belangrijk: hier moet `await` gebruikt worden. Geven we `fn(...)`
    // rechtstreeks terug, dan wordt een eventuele opgegooide error (bv. een
    // redirect) niet hier opgevangen maar via de catch van de promise die
    // de aanroeper zelf krijgt — en dan komt hij nooit bij de catch hieronder.
    const result = getProfile
      ? await (fn as ProtectedAction<T, P>)(data, profile!, rawFormData)
      : await (fn as PublicAction<T>)(data, rawFormData);
    return result ?? { success: true };
  } catch (error) {
    if (isNextNavigationError(error)) {
      throw error;
    }

    console.error("Error in formAction:", error);

    return {
      errors: {
        errors: ["Er ging iets mis. Controleer of je ingelogd bent en probeer opnieuw."],
      },
      success: false,
      submittedData: (unvalidatedData instanceof FormData
        ? Object.fromEntries(unvalidatedData.entries())
        : unvalidatedData) as Record<string, string>,
    };
  }
}

/** Valideert `data` (FormData of plain object) tegen `schema`. */
export function validateSchema<T extends ZodSchema>(schema: T, data: unknown): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data instanceof FormData ? convertFormData(data) : data);
  return result.success
    ? { data: result.data, errors: null }
    : { data: null, errors: result.error.flatten().fieldErrors };
}

export type ValidationErrors = Record<string, string[] | undefined>;

/** Vaste retourvorm van elke server action die via `formAction`/`serverFunction` loopt. */
export type ServerFunctionResponse = {
  errors?: ValidationErrors;
  success: boolean;
  submittedData?: Record<string, string>;
};

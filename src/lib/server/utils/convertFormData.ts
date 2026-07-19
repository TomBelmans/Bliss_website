/**
 * Zet een FormData-object om naar een plain object, zodat het door een Zod-
 * schema gevalideerd kan worden. Ondersteunt geneste keys met puntnotatie
 * (bv. `items.0.name`) door ze om te vormen tot geneste objecten/arrays.
 */
export function convertFormData<T>(data: FormData): T {
  const result: Record<string, unknown> = {};

  // Verwijder alle keys die beginnen met $ACTION; dit zijn interne velden
  // die Next.js zelf toevoegt aan server action-form-submissions.
  const keys = Array.from(data.keys()).filter((key) => !key.startsWith("$ACTION"));

  // Voeg alle top-level keys toe aan het resultaat.
  keys.filter((key) => !key.includes(".")).forEach((key) => (result[key] = data.get(key)));

  // Vorm geneste form-data-keys zoals arrayNaam.index.key of objectNaam.key om naar een object.
  const multipartKeys = keys.filter((key) => key.includes("."));
  // Sorteer zodat eerst de elementen op positie 0 verwerkt worden, dan positie 1, enz.
  multipartKeys.sort();

  for (const multipartKey of multipartKeys) {
    const keyParts = multipartKey.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = result;

    for (let i = 0; i < keyParts.length; i++) {
      const keyPart = keyParts[i];

      // Als dit het laatste deel is, is dit de naam van de property.
      if (i === keyParts.length - 1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        current[keyPart] = data.get(multipartKey);
        continue;
      }

      // Maak de key aan als die nog niet bestaat (kan al bestaan door een eerder verwerkte multipart-key).
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!current[keyPart]) {
        // Als het volgende deel een getal is, is het een array-index; anders een object.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        current[keyPart] = isNaN(parseInt(keyParts[i + 1])) ? {} : [];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      current = current[keyPart];
    }
  }

  return result as T;
}

/**
 * Land → belcode / vlag voor telefoonvelden bij accountaanmaak.
 * Namen zijn lowercase zonder diakritische tekens voor matching.
 */

export type CountryCallingInfo = {
  iso: string;
  dial: string;
};

const COUNTRY_CALLING: Array<CountryCallingInfo & { aliases: string[] }> = [
  { iso: "BE", dial: "+32", aliases: ["belgie", "belgium", "belgien"] },
  { iso: "NL", dial: "+31", aliases: ["nederland", "netherlands", "holland", "the netherlands"] },
  { iso: "FR", dial: "+33", aliases: ["frankrijk", "france", "frankreich"] },
  { iso: "DE", dial: "+49", aliases: ["duitsland", "germany", "deutschland"] },
  { iso: "LU", dial: "+352", aliases: ["luxemburg", "luxembourg"] },
  { iso: "GB", dial: "+44", aliases: ["verenigd koninkrijk", "united kingdom", "uk", "groot-brittannie", "england"] },
];

const DEFAULT_CALLING: CountryCallingInfo = COUNTRY_CALLING[0];

/** PNG-vlag-URL (flagcdn) — emoji-vlaggen tonen op Windows vaak als letters (BE BE). */
export function flagImageUrl(iso: string, width = 20): string {
  return `https://flagcdn.com/w${width}/${iso.toLowerCase()}.png`;
}

function normalizeCountryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

export function resolveCallingInfo(country: string): CountryCallingInfo {
  const key = normalizeCountryName(country);
  if (!key) return DEFAULT_CALLING;
  const match = COUNTRY_CALLING.find((c) => c.aliases.includes(key) || c.iso.toLowerCase() === key);
  return match ?? DEFAULT_CALLING;
}

export function dialPrefix(dial: string): string {
  return `${dial} `;
}

/** Nationaal deel zonder belcode; leidende nullen worden verwijderd. */
export function nationalDigits(value: string, dial: string): string {
  let rest = value.trim();
  if (rest.startsWith(dial)) {
    rest = rest.slice(dial.length);
  } else if (rest.startsWith("+")) {
    rest = rest.replace(/^\+\d+/, "");
  }
  rest = rest.replace(/[^\d\s]/g, "").trimStart();
  return rest.replace(/^0+/, "").trimStart();
}

/** Zet een ruwe invoer om naar `+32 475 …` (belcode + nationaal zonder leidende 0). */
export function normalizePhoneForCountry(raw: string, country: string): string {
  const { dial } = resolveCallingInfo(country);
  return dialPrefix(dial) + nationalDigits(raw, dial);
}

/** Bij landwijziging: behoud nationaal nummer, wissel belcode. */
export function retargetPhoneCountry(value: string, nextCountry: string): string {
  const { dial } = resolveCallingInfo(nextCountry);
  const national = nationalDigits(value, dial);
  return dialPrefix(dial) + national;
}

/** true als er geen nationaal nummer is (enkel belcode of leeg). */
export function isPhoneEmpty(value: string, country: string): boolean {
  const { dial } = resolveCallingInfo(country);
  return nationalDigits(value, dial).replace(/\s/g, "") === "";
}

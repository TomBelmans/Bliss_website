/** Hoe lang een beheerder-sessie geldig blijft na inloggen. */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Naam van de httpOnly cookie die het beheerder-sessie-token bevat. */
export const SESSION_COOKIE_NAME = "bliss_session";

/** Hoe lang een klant-sessie geldig blijft na inloggen/registreren (langer dan de beheerder: gemaksfunctie voor terugkerende klanten). */
export const CUSTOMER_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/** Naam van de httpOnly cookie die het klant-sessie-token bevat (apart van de beheerder-cookie). */
export const CUSTOMER_SESSION_COOKIE_NAME = "bliss_customer_session";

/** localStorage-sleutel voor de light/dark/system-themavoorkeur van het beheerderspaneel. */
export const THEME_STORAGE_KEY = "bliss-admin-theme";

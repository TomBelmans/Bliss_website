import "server-only";
import { redirect } from "next/navigation";
import type { CustomerProfile, CustomerSessionWithProfile } from "@models";
import { getCustomerSessionId, setCustomerSessionCookie } from "@serverUtils";
import DAL from "@dal";
import { CUSTOMER_SESSION_DURATION_MS } from "@/lib/constants";

/** Leest de klant-sessiecookie en laadt CustomerSession + Customer uit de DAL. */
export async function getCustomerSession(): Promise<CustomerSessionWithProfile | null> {
  const sessionId = await getCustomerSessionId();
  return sessionId ? await DAL.getCustomerSessionProfile(sessionId) : null;
}

/** Profiel van de ingelogde klant, of `null` zonder geldige sessie. */
export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const session = await getCustomerSession();
  return session?.customer ?? null;
}

/** Zoals `getCustomerProfile`, maar redirect naar `/account` (of `url`) zonder sessie. */
export async function getCustomerProfileOrRedirect(
  url: string = "/account"
): Promise<CustomerProfile> {
  const profile = await getCustomerProfile();

  if (!profile) {
    return redirect(url);
  }

  return profile;
}

/**
 * Haalt het profiel van de ingelogde klant op voor gebruik binnen
 * `customerFormAction` / `customerServerFunction`. Verlengt de sessie
 * automatisch als die nog maar minder dan de helft van de geldigheidsduur
 * te gaan heeft. Gooit bij ontbrekende sessie (zodat de mediator een
 * uniforme fout kan teruggeven).
 */
export async function getCustomerProfileAndOptionallyExtend(): Promise<CustomerProfile> {
  const session = await getCustomerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.activeUntil.getTime() - Date.now() < CUSTOMER_SESSION_DURATION_MS / 2) {
    await extendCustomerSessionAndRefreshCookie(session.id);
  }

  return session.customer;
}

async function extendCustomerSessionAndRefreshCookie(id: string): Promise<void> {
  const extendedSession = await DAL.extendCustomerSession(id);
  await setCustomerSessionCookie(extendedSession);
}

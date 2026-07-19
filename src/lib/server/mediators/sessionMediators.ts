import "server-only";
import { redirect } from "next/navigation";
import type { Profile, SessionWithProfile } from "@models";
import { getSessionId, setSessionCookie } from "@serverUtils";
import DAL from "@dal";
import { SESSION_DURATION_MS } from "@/lib/constants";

/** Leest de admin-sessiecookie en laadt Session + User uit de DAL. */
export async function getSession(): Promise<SessionWithProfile | null> {
  const sessionId = await getSessionId();
  return sessionId ? await DAL.getSessionProfile(sessionId) : null;
}

/** Profiel van de ingelogde beheerder, of `null` als er geen geldige sessie is. */
export async function getSessionProfile(): Promise<Profile | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** Zoals `getSessionProfile`, maar redirect naar login als er geen sessie is. */
export async function getSessionProfileOrRedirect(url: string = "/admin/login"): Promise<Profile> {
  const profile = await getSessionProfile();

  if (!profile) {
    return redirect(url);
  }

  return profile;
}

/**
 * Haalt het profiel van de ingelogde gebruiker op voor gebruik binnen
 * `formAction`/`serverFunction`. Verlengt de sessie automatisch als die nog
 * maar minder dan de helft van de geldigheidsduur te gaan heeft. Gooit een
 * error (i.p.v. te redirecten) zodat de aanroeper zelf beslist hoe een
 * ontbrekende sessie afgehandeld wordt.
 */
export async function getSessionProfileAndOptionallyExtend(): Promise<Profile> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.activeUntil.getTime() - Date.now() < SESSION_DURATION_MS / 2) {
    await extendSessionAndRefreshCookie(session.id);
  }

  return session.user;
}

async function extendSessionAndRefreshCookie(id: string): Promise<void> {
  const extendedSession = await DAL.extendSession(id);
  await setSessionCookie(extendedSession);
}

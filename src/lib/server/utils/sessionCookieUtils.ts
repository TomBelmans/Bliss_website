import "server-only";
import { cookies } from "next/headers";
import type { Session, CustomerSession } from "@/generated/prisma/client";
import { SESSION_COOKIE_NAME, CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/constants";

export async function setSessionCookie(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.activeUntil,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionId(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

/** Zelfde als hierboven, maar voor de klant-sessie (aparte cookie van de beheerder). */
export async function setCustomerSessionCookie(session: CustomerSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.activeUntil,
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE_NAME);
}

export async function getCustomerSessionId(): Promise<string | undefined> {
  return (await cookies()).get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
}

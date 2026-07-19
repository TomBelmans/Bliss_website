/**
 * Server actions voor admin-auth: inloggen, uitloggen en wachtwoord wijzigen.
 * Wrappers: `publicFormAction` / `formAction` / direct; DAL: `users.ts`.
 * UI: admin loginpagina, wachtwoordformulier, uitlogknop.
 */
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { formAction, publicFormAction } from "@mediators";
import { signInSchema, changePasswordSchema } from "@schemas";
import { signIn as signInDal, getUserById, updateUserPassword, stopSession } from "@dal";
import { verifyPassword, setSessionCookie, clearSessionCookie, getSessionId } from "@serverUtils";

const loginFormSchema = signInSchema.extend({
  next: z.string().optional(),
});

/**
 * Admin inloggen + sessiecookie.
 * Wrapper: `publicFormAction` → DAL `signIn`. UI: `/admin/login`.
 */
export const signIn = publicFormAction(loginFormSchema, async ({ email, password, next }) => {
  const result = await signInDal(email, password);
  if (!result) {
    return {
      success: false,
      errors: { errors: ["Ongeldig e-mailadres of wachtwoord."] },
    };
  }

  await setSessionCookie(result.session);
  redirect(next && next.startsWith("/") ? next : "/admin");
});

/**
 * Admin uitloggen: sessie wissen + cookie clear + redirect.
 * DAL: `stopSession`. UI: admin uitlogknop.
 */
export async function signOut(): Promise<void> {
  const sessionId = await getSessionId();
  if (sessionId) {
    await stopSession(sessionId);
  }
  await clearSessionCookie();
  redirect("/admin/login");
}

/**
 * Huidig wachtwoord controleren en nieuw zetten.
 * Wrapper: `formAction` → DAL `getUserById` + `updateUserPassword`.
 * UI: admin wachtwoordwijzigingsformulier.
 */
export const changePassword = formAction(changePasswordSchema, async (data, profile) => {
  const user = await getUserById(profile.id);
  if (!user || !verifyPassword(data.currentPassword, user.password)) {
    return {
      success: false,
      errors: { errors: ["Huidig wachtwoord is onjuist."] },
    };
  }

  await updateUserPassword(profile.id, data.newPassword);
  return { success: true };
});

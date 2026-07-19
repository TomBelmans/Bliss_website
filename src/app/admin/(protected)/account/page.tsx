/**
 * Pagina: /admin/account
 * Doel: Ingelogde beheerder bekijken en wachtwoord wijzigen.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - Profile (User.id, email, …) — via mediator `getSessionProfileOrRedirect`
 *
 * Acties / mutaties (via child components of forms):
 * - `changePassword` (AccountForm) → DAL `getUserById` + `updateUserPassword` — User.password
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { getSessionProfileOrRedirect } from "@mediators";
import { AccountForm } from "@/components/custom/account/accountForm";

export const metadata = { title: "Mijn account" };

export default async function AccountPage() {
  const profile = await getSessionProfileOrRedirect();
  return <AccountForm {...profile} />;
}

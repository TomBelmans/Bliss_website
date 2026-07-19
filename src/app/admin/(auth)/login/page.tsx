/**
 * Pagina: /admin/login
 * Doel: Beheerder inloggen in de admin-omgeving.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - geen (formulier alleen; sessie wordt gezet na succesvolle login)
 *
 * Acties / mutaties (via child components of forms):
 * - `signIn` (AuthForm) → DAL `signIn` — User.email, User.password; zet sessiecookie
 *
 * searchParams:
 * - `next` — doorgegeven aan AuthForm als redirect-doel na login (default `/admin`)
 *
 * Lokale functies op deze pagina:
 * - geen
 */
import { Suspense } from "react";
import { AuthForm } from "../authForm";

export const metadata = { title: "Inloggen" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}

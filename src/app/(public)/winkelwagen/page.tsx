import { getCustomerProfile } from "@mediators";
import { WinkelwagenCart } from "@/components/WinkelwagenCart";

/**
 * Pagina: /winkelwagen
 * Doel: Winkelwagen-UI en checkout doorgeven aan `WinkelwagenCart`.
 *
 * Data (entiteit.attributen via DAL/mediator):
 * - CustomerProfile (volledig of null) — via mediator `getCustomerProfile`
 *   (wordt als prop doorgegeven; cart zelf zit in client-context)
 *
 * Acties / mutaties (via child components of API):
 * - `WinkelwagenCart`: optioneel `registerCustomer` / `signInCustomer`; daarna
 *   POST `/api/checkout` (Stripe) met cartregels
 *
 * Lokale functies op deze pagina:
 * - (geen)
 */
export const dynamic = "force-dynamic";

export default async function WinkelwagenPage() {
  const customerProfile = await getCustomerProfile();

  return <WinkelwagenCart customerProfile={customerProfile} />;
}

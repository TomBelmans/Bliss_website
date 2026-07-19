import * as users from "./users";
import * as customers from "./customers";
import * as services from "./services";
import * as products from "./products";
import * as orders from "./orders";
import * as bookings from "./bookings";
import * as workingHours from "./workingHours";
import * as categories from "./categories";
import * as productAttributes from "./productAttributes";

/**
 * Om het aantal import statements te beperken en de code overzichtelijk te
 * houden, groeperen we alle dal-functies in dit bestand. We exporteren alle
 * named exports opnieuw zodat je `import {listActiveServices} from '@dal'`
 * kan gebruiken.
 */
export * from "./users";
export * from "./customers";
export * from "./services";
export * from "./products";
export * from "./orders";
export * from "./bookings";
export * from "./workingHours";
export * from "./categories";
export * from "./productAttributes";

/**
 * Default export met alle dal-functies gegroepeerd als één object, handig
 * wanneer je liever `DAL.listActiveServices()` schrijft dan losse named
 * imports bij te houden.
 */
const DAL = {
  ...users,
  ...customers,
  ...services,
  ...products,
  ...orders,
  ...bookings,
  ...workingHours,
  ...categories,
  ...productAttributes,
};

export default DAL;

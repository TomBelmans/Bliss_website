import * as users from "./users";
import * as customers from "./customers";
import * as actions from "./actions";
import * as services from "./services";
import * as products from "./products";
import * as orders from "./orders";
import * as bookings from "./bookings";

/**
 * Om het aantal import statements te beperken en de code overzichtelijk te
 * houden, groeperen we alle modeltypes in dit bestand. We exporteren alle
 * named exports opnieuw zodat je `import {Profile} from '@models'` kan
 * gebruiken.
 */
export * from "./users";
export * from "./customers";
export * from "./actions";
export * from "./services";
export * from "./products";
export * from "./orders";
export * from "./bookings";

const Models = {
  ...users,
  ...customers,
  ...actions,
  ...services,
  ...products,
  ...orders,
  ...bookings,
};

export default Models;

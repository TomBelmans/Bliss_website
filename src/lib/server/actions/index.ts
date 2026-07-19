import * as users from "./users";
import * as customers from "./customers";
import * as services from "./services";
import * as products from "./products";
import * as bookings from "./bookings";
import * as orders from "./orders";
import * as workingHours from "./workingHours";
import * as categories from "./categories";
import * as productAttributes from "./productAttributes";
import * as contact from "./contact";

export * from "./users";
export * from "./customers";
export * from "./services";
export * from "./products";
export * from "./bookings";
export * from "./orders";
export * from "./workingHours";
export * from "./categories";
export * from "./productAttributes";
export * from "./contact";

const Actions = {
  ...users,
  ...customers,
  ...services,
  ...products,
  ...bookings,
  ...orders,
  ...workingHours,
  ...categories,
  ...productAttributes,
  ...contact,
};

export default Actions;

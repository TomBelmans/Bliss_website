import * as userSchemas from "./userSchemas";
import * as customerSchemas from "./customerSchemas";
import * as categorySchemas from "./categorySchemas";
import * as productAttributeSchemas from "./productAttributeSchemas";
import * as serviceSchemas from "./serviceSchemas";
import * as productSchemas from "./productSchemas";
import * as bookingSchemas from "./bookingSchemas";
import * as orderSchemas from "./orderSchemas";
import * as workingHoursSchemas from "./workingHoursSchemas";
import * as contactSchemas from "./contactSchemas";

export * from "./userSchemas";
export * from "./customerSchemas";
export * from "./categorySchemas";
export * from "./productAttributeSchemas";
export * from "./serviceSchemas";
export * from "./productSchemas";
export * from "./bookingSchemas";
export * from "./orderSchemas";
export * from "./workingHoursSchemas";
export * from "./contactSchemas";

const Schemas = {
  ...userSchemas,
  ...customerSchemas,
  ...categorySchemas,
  ...productAttributeSchemas,
  ...serviceSchemas,
  ...productSchemas,
  ...bookingSchemas,
  ...orderSchemas,
  ...workingHoursSchemas,
  ...contactSchemas,
};

export default Schemas;

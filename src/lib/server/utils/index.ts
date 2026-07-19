import * as password from "./passwordUtils";
import * as cookie from "./sessionCookieUtils";
import * as convertFormData from "./convertFormData";
import * as routeResponses from "./routeResponses";

/**
 * Om het aantal import statements te beperken en de code overzichtelijk te
 * houden, groeperen we alle server-utils in dit bestand. We exporteren alle
 * named exports opnieuw zodat je `import {hashPassword} from '@serverUtils'`
 * kan gebruiken.
 */
export * from "./passwordUtils";
export * from "./sessionCookieUtils";
export * from "./convertFormData";
export * from "./routeResponses";

const ServerUtils = {
  ...password,
  ...cookie,
  ...convertFormData,
  ...routeResponses,
};

export default ServerUtils;

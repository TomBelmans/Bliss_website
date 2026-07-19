import * as sessions from "./sessionMediators";
import * as customerSessions from "./customerSessionMediators";
import * as actions from "./actionMediators";

export * from "./sessionMediators";
export * from "./customerSessionMediators";
export * from "./actionMediators";

const Mediators = {
  ...sessions,
  ...customerSessions,
  ...actions,
};

export default Mediators;

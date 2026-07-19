/** Nederlandse weergavelabels voor de status-enums, gedeeld door alle publieke en admin-pagina's. */

export const bookingStatusLabels: Record<string, string> = {
  PENDING: "in afwachting",
  CONFIRMED: "bevestigd",
  CANCELLED: "geannuleerd",
};

export const orderStatusLabels: Record<string, string> = {
  PENDING: "in afwachting",
  PAID: "betaald",
  FULFILLED: "verzonden",
  CANCELLED: "geannuleerd",
  REFUNDED: "terugbetaald",
};

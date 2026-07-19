import type { Booking } from "@/generated/prisma/client";

export type CreateBookingParams = Pick<
  Booking,
  | "serviceId"
  | "serviceName"
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "notes"
  | "startsAt"
  | "endsAt"
> &
  Partial<Pick<Booking, "customerId">>;

export type BookingTimeframe = "upcoming" | "past" | "all" | "cancelled";

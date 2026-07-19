import type { Service, ServiceCategory } from "@/generated/prisma/client";

export type CreateServiceParams = Pick<
  Service,
  "name" | "description" | "durationMinutes" | "priceCents" | "active"
>;

export type UpdateServiceParams = Partial<CreateServiceParams>;

/** Dienst met de toegekende categorieën (junction al platgeslagen). */
export type ServiceWithCategories = Service & { categories: ServiceCategory[] };

/**
 * Data Access Layer voor behandelingen/diensten (`Service`, junction
 * `ServiceOnCategory` / `ServiceCategory`).
 * Aangeroepen door: publieke diensten/boeken-pagina's, availability API,
 * admin diensten-pagina's en service server actions.
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { Service, ServiceCategory } from "@/generated/prisma/client";
import type { CreateServiceParams, UpdateServiceParams, ServiceWithCategories } from "@models";

const categoriesInclude = {
  categories: { include: { category: true }, orderBy: { category: { name: "asc" } } },
} as const;

type ServiceRow = Service & { categories: Array<{ category: ServiceCategory }> };

/** Slaat de junction-rijen plat naar een gewone lijst categorieën. */
function flattenCategories(row: ServiceRow): ServiceWithCategories {
  const { categories, ...service } = row;
  return { ...service, categories: categories.map((link) => link.category) };
}

/**
 * Actieve diensten met categorieën, gesorteerd op `sortOrder`. Model: `Service`.
 * Aangeroepen door homepage, `/diensten`, `/boeken` en admin-dashboard.
 */
export async function listActiveServices(): Promise<ServiceWithCategories[]> {
  const rows = await prismaClient.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: categoriesInclude,
  });
  return rows.map(flattenCategories);
}

/**
 * Alle diensten (actief + inactief) voor de admin-lijst. Model: `Service`.
 */
export async function listAllServices(): Promise<ServiceWithCategories[]> {
  const rows = await prismaClient.service.findMany({
    orderBy: { sortOrder: "asc" },
    include: categoriesInclude,
  });
  return rows.map(flattenCategories);
}

/**
 * Één dienst met categorieën. Model: `Service`.
 * Aangeroepen door admin bewerkpagina en `/api/availability`.
 */
export async function getServiceById(id: string): Promise<ServiceWithCategories | null> {
  const row = await prismaClient.service.findUnique({
    where: { id },
    include: categoriesInclude,
  });
  return row ? flattenCategories(row) : null;
}

/**
 * Maakt een dienst + category-links aan. Model: `Service`.
 * Aangeroepen door `createService` action.
 */
export async function createService(
  data: CreateServiceParams,
  categoryIds: string[]
): Promise<Service> {
  return prismaClient.service.create({
    data: {
      ...data,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
    },
  });
}

/**
 * Werkt een dienst bij; optioneel categorieën volledig vervangen. Model: `Service`.
 * Aangeroepen door `updateService` action.
 */
export async function updateService(
  id: string,
  data: UpdateServiceParams,
  categoryIds?: string[]
): Promise<Service> {
  return prismaClient.service.update({
    where: { id },
    data: {
      ...data,
      // Categorieën worden volledig vervangen door de meegegeven selectie.
      ...(categoryIds
        ? { categories: { deleteMany: {}, create: categoryIds.map((categoryId) => ({ categoryId })) } }
        : {}),
    },
  });
}

/**
 * Hard-delete van een dienst. Model: `Service`.
 * Aangeroepen door `deleteService` action.
 */
export async function deleteService(id: string): Promise<void> {
  await prismaClient.service.delete({ where: { id } });
}

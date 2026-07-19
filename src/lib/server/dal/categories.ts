/**
 * Data Access Layer voor categorieën (`ServiceCategory`, `ProductCategory`).
 * Aangeroepen door admin diensten-/productenpagina's en category actions
 * (inline aanmaken vanuit CategoryPicker).
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { ServiceCategory, ProductCategory } from "@/generated/prisma/client";

/**
 * Alle dienstcategorieën, alfabetisch. Model: `ServiceCategory`.
 * Aangeroepen door admin dienstenlijst/-formulieren.
 */
export async function listServiceCategories(): Promise<ServiceCategory[]> {
  return prismaClient.serviceCategory.findMany({ orderBy: { name: "asc" } });
}

/** Gooit Prisma P2002 wanneer de naam al bestaat — de action vertaalt dat naar een nette melding. */
export async function createServiceCategory(name: string): Promise<ServiceCategory> {
  return prismaClient.serviceCategory.create({ data: { name } });
}

/**
 * Alle productcategorieën, alfabetisch. Model: `ProductCategory`.
 * Aangeroepen door admin productenlijst/-formulieren.
 */
export async function listProductCategories(): Promise<ProductCategory[]> {
  return prismaClient.productCategory.findMany({ orderBy: { name: "asc" } });
}

/**
 * Maakt een productcategorie aan. Model: `ProductCategory`.
 * Aangeroepen door `createProductCategory` action.
 */
export async function createProductCategory(name: string): Promise<ProductCategory> {
  return prismaClient.productCategory.create({ data: { name } });
}

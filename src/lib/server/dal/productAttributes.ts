/**
 * Data Access Layer voor productattributen (`Brand`, `ContentUnit`).
 * Aangeroepen door admin productenpagina's/-formulieren en
 * productAttributes actions (inline aanmaken vanuit ProductForm).
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { Brand, ContentUnit } from "@/generated/prisma/client";

/**
 * Alle merken, alfabetisch. Model: `Brand`.
 * Aangeroepen door admin productenlijst/-formulieren.
 */
export async function listBrands(): Promise<Brand[]> {
  return prismaClient.brand.findMany({ orderBy: { name: "asc" } });
}

/** Gooit Prisma P2002 wanneer de naam al bestaat — de action vertaalt dat naar een nette melding. */
export async function createBrand(name: string): Promise<Brand> {
  return prismaClient.brand.create({ data: { name } });
}

/**
 * Alle inhoudseenheden, alfabetisch. Model: `ContentUnit`.
 * Aangeroepen door admin productformulieren.
 */
export async function listContentUnits(): Promise<ContentUnit[]> {
  return prismaClient.contentUnit.findMany({ orderBy: { name: "asc" } });
}

/**
 * Maakt een inhoudseenheid aan. Model: `ContentUnit`.
 * Aangeroepen door `createContentUnit` action.
 */
export async function createContentUnit(name: string): Promise<ContentUnit> {
  return prismaClient.contentUnit.create({ data: { name } });
}

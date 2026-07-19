/**
 * Data Access Layer voor producten (`Product`, junction `ProductOnCategory`,
 * plus `Brand`/`ContentUnit` via includes).
 * Aangeroepen door: winkel- en admin-productpagina's, checkout/image API's,
 * Stripe-webhook (voorraad) en product server actions.
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { Product, ProductCategory, Brand, ContentUnit } from "@/generated/prisma/client";
import type {
  ProductListItem,
  ProductWithCategories,
  CreateProductParams,
  UpdateProductParams,
} from "@models";

const productIncludes = {
  categories: { include: { category: true }, orderBy: { category: { name: "asc" } } },
  brand: true,
  contentUnit: true,
} as const;

type ProductRow = ProductListItem & {
  categories: Array<{ category: ProductCategory }>;
  brand: Brand | null;
  contentUnit: ContentUnit | null;
};

/** Slaat de junction-rijen (categorieën) plat naar een gewone lijst; merk/inhoudseenheid staan al direct op de rij. */
function flattenCategories(row: ProductRow): ProductWithCategories {
  const { categories, ...product } = row;
  return { ...product, categories: categories.map((link) => link.category) };
}

/**
 * Actieve producten met categorieën/merk/inhoudseenheid (zonder image-bytes).
 * Model: `Product`. Aangeroepen door `/winkel` en admin-dashboard.
 */
export async function listActiveProducts(): Promise<ProductWithCategories[]> {
  const rows = await prismaClient.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    omit: { image: true },
    include: productIncludes,
  });
  return rows.map(flattenCategories);
}

/** Zet of wist `outOfStockAt` wanneer de voorraad 0 / >0 wordt. */
function outOfStockAtForQuantity(
  stockQuantity: number,
  previousOutOfStockAt?: Date | null
): Date | null {
  if (stockQuantity > 0) return null;
  return previousOutOfStockAt ?? new Date();
}

/**
 * Alle producten (actief + inactief) voor de admin-lijst. Model: `Product`.
 */
export async function listAllProducts(): Promise<ProductWithCategories[]> {
  const rows = await prismaClient.product.findMany({
    orderBy: { createdAt: "desc" },
    omit: { image: true },
    include: productIncludes,
  });
  return rows.map(flattenCategories);
}

/** Ruwe productrij inclusief image-bytes. Model: `Product`. */
export async function getProductById(id: string): Promise<Product | null> {
  return prismaClient.product.findUnique({ where: { id } });
}

/**
 * Actief product met categorieën/merk/inhoudseenheid. Model: `Product`.
 * Aangeroepen door `/winkel/[id]`.
 */
export async function getActiveProductById(id: string): Promise<ProductWithCategories | null> {
  const row = await prismaClient.product.findFirst({
    where: { id, active: true },
    omit: { image: true },
    include: productIncludes,
  });
  return row ? flattenCategories(row) : null;
}

/** Voor het admin-bewerkformulier: ook inactieve producten, mét categorieën/merk/inhoudseenheid. */
export async function getProductWithCategoriesById(
  id: string
): Promise<ProductWithCategories | null> {
  const row = await prismaClient.product.findUnique({
    where: { id },
    omit: { image: true },
    include: productIncludes,
  });
  return row ? flattenCategories(row) : null;
}

/**
 * Producten op id-lijst (zonder image), voor prijs/voorraad bij checkout.
 * Model: `Product`. Aangeroepen door `/api/checkout`.
 */
export async function getProductsByIds(ids: string[]): Promise<ProductListItem[]> {
  return prismaClient.product.findMany({
    where: { id: { in: ids } },
    omit: { image: true },
  });
}

/**
 * Enkel image-bytes + mime-type. Model: `Product`.
 * Aangeroepen door `/api/products/[id]/image`.
 */
export async function getProductImage(
  id: string
): Promise<Pick<Product, "image" | "imageMimeType"> | null> {
  return prismaClient.product.findUnique({
    where: { id },
    select: { image: true, imageMimeType: true },
  });
}

/**
 * Maakt een product + category-links aan.
 * Zet `outOfStockAt` op nu bij stock 0, anders null. Model: `Product`.
 * Aangeroepen door `createProduct` action.
 */
export async function createProduct(
  data: CreateProductParams,
  categoryIds: string[]
): Promise<ProductListItem> {
  return prismaClient.product.create({
    data: {
      ...data,
      outOfStockAt: outOfStockAtForQuantity(data.stockQuantity),
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
    },
    omit: { image: true },
  });
}

/**
 * Werkt product bij; optioneel categorieën volledig vervangen.
 * Bij stock-wijziging: `outOfStockAt` wissen bij >0, of behouden/zetten bij 0.
 * Model: `Product`. Aangeroepen door `updateProduct` action.
 */
export async function updateProduct(
  id: string,
  data: UpdateProductParams,
  categoryIds?: string[]
): Promise<ProductListItem> {
  const previous =
    data.stockQuantity !== undefined
      ? await prismaClient.product.findUnique({
          where: { id },
          select: { outOfStockAt: true },
        })
      : null;

  return prismaClient.product.update({
    where: { id },
    data: {
      ...data,
      ...(data.stockQuantity !== undefined
        ? {
            outOfStockAt: outOfStockAtForQuantity(
              data.stockQuantity,
              previous?.outOfStockAt
            ),
          }
        : {}),
      // Categorieën worden volledig vervangen door de meegegeven selectie.
      ...(categoryIds
        ? { categories: { deleteMany: {}, create: categoryIds.map((categoryId) => ({ categoryId })) } }
        : {}),
    },
    omit: { image: true },
  });
}

/**
 * Hard-delete van een product. Model: `Product`.
 * Aangeroepen door `deleteProduct` action.
 */
export async function deleteProduct(id: string): Promise<void> {
  await prismaClient.product.delete({ where: { id } });
}

/**
 * Verlaagt voorraad atomisch na betaling. Bij 0: behoudt eerste `outOfStockAt`
 * (COALESCE); bij restock niet gebruikt — dat gaat via `updateProduct`.
 * Model: `Product`. Aangeroepen door Stripe-webhook.
 */
export async function decrementStock(id: string, quantity: number): Promise<void> {
  // Bij voorraad 0: bewaar de eerste uitverkoopdatum (COALESCE). Bij restock zou
  // deze raw update niet lopen — restock gebeurt via updateProduct.
  await prismaClient.$executeRaw`
    UPDATE "Product"
    SET
      "stockQuantity" = GREATEST("stockQuantity" - ${quantity}, 0),
      "outOfStockAt" = CASE
        WHEN GREATEST("stockQuantity" - ${quantity}, 0) = 0
          THEN COALESCE("outOfStockAt", NOW())
        ELSE NULL
      END
    WHERE id = ${id}::uuid
  `;
}

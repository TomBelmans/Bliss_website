import type { Product, ProductCategory, Brand, ContentUnit } from "@/generated/prisma/client";

/** Product zonder de (potentieel grote) foto-bytes; gebruik `imageMimeType` om te weten of er een foto is. */
export type ProductListItem = Omit<Product, "image">;

export type CreateProductParams = Pick<
  Product,
  "name" | "description" | "priceCents" | "stockQuantity" | "active"
> &
  Partial<Pick<Product, "image" | "imageMimeType" | "volume" | "brandId" | "contentUnitId">>;

export type UpdateProductParams = Partial<CreateProductParams>;

/** Product (zonder foto-bytes) met de toegekende categorieën, merk en inhoudseenheid uitgeschreven. */
export type ProductWithCategories = ProductListItem & {
  categories: ProductCategory[];
  brand: Brand | null;
  contentUnit: ContentUnit | null;
};

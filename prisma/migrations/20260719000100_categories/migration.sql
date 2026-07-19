-- Categorieën vervangen het slug-veld op Service en Product. Volgorde is
-- belangrijk: eerst de nieuwe tabellen, dan de bestaande slugs omzetten
-- naar categorieën (data-migratie), en pas daarna de slug-kolommen droppen.

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategoryLink" (
    "serviceId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "ServiceCategoryLink_pkey" PRIMARY KEY ("serviceId","categoryId")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategoryLink" (
    "productId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "ProductCategoryLink_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_id_key" ON "ServiceCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_id_key" ON "ProductCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- AddForeignKey
ALTER TABLE "ServiceCategoryLink" ADD CONSTRAINT "ServiceCategoryLink_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategoryLink" ADD CONSTRAINT "ServiceCategoryLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryLink" ADD CONSTRAINT "ProductCategoryLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryLink" ADD CONSTRAINT "ProductCategoryLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data-migratie: elke bestaande slug wordt een categorie met een leesbare
-- naam ("klassieke-gelaatsverzorging" → "Klassieke gelaatsverzorging"), en
-- elke dienst/product wordt aan zijn eigen categorie gekoppeld.
INSERT INTO "ServiceCategory" ("name")
SELECT DISTINCT initcap(substring(replace("slug", '-', ' ') from 1 for 1)) || substring(replace("slug", '-', ' ') from 2)
FROM "Service"
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "ServiceCategoryLink" ("serviceId", "categoryId")
SELECT s."id", c."id"
FROM "Service" s
JOIN "ServiceCategory" c
  ON c."name" = initcap(substring(replace(s."slug", '-', ' ') from 1 for 1)) || substring(replace(s."slug", '-', ' ') from 2)
ON CONFLICT DO NOTHING;

INSERT INTO "ProductCategory" ("name")
SELECT DISTINCT initcap(substring(replace("slug", '-', ' ') from 1 for 1)) || substring(replace("slug", '-', ' ') from 2)
FROM "Product"
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "ProductCategoryLink" ("productId", "categoryId")
SELECT p."id", c."id"
FROM "Product" p
JOIN "ProductCategory" c
  ON c."name" = initcap(substring(replace(p."slug", '-', ' ') from 1 for 1)) || substring(replace(p."slug", '-', ' ') from 2)
ON CONFLICT DO NOTHING;

-- DropIndex
DROP INDEX "Service_slug_key";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "slug";

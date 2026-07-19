-- AlterTable
ALTER TABLE "Product" ADD COLUMN "outOfStockAt" TIMESTAMP(3);

-- Bestaande uitverkochte producten: zet een startdatum zodat de admin-filter meteen werkt.
UPDATE "Product"
SET "outOfStockAt" = CURRENT_TIMESTAMP
WHERE "stockQuantity" <= 0 AND "outOfStockAt" IS NULL;

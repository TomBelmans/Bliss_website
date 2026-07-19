-- AlterTable Customer: SCD2-ondersteuning + soft-delete
ALTER TABLE "Customer" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Customer" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Bestaande rijen: updatedAt gelijkzetten aan createdAt
UPDATE "Customer" SET "updatedAt" = "createdAt";

-- CreateTable CustomerHistory
CREATE TABLE "CustomerHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "street" VARCHAR(255) NOT NULL,
    "houseNumber" VARCHAR(20) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerHistory_id_key" ON "CustomerHistory"("id");
CREATE INDEX "CustomerHistory_customerId_validTo_idx" ON "CustomerHistory"("customerId", "validTo");

ALTER TABLE "CustomerHistory" ADD CONSTRAINT "CustomerHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import type { PrismaClient } from "@/generated/prisma/client";
import { hashPassword } from "@serverUtils";

export const seedDev = async (prisma: PrismaClient) => {
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashPassword("test123test"),
    },
  });

  const [gelaatsverzorging, nagels, wenkbrauwen] = await Promise.all([
    prisma.serviceCategory.create({ data: { name: "Gelaatsverzorging" } }),
    prisma.serviceCategory.create({ data: { name: "Nagels" } }),
    prisma.serviceCategory.create({ data: { name: "Wenkbrauwen en wimpers" } }),
  ]);

  await Promise.all([
    prisma.service.create({
      data: {
        name: "Klassieke gelaatsverzorging",
        description: "Reiniging, peeling, masker en massage op maat van je huid.",
        durationMinutes: 60,
        priceCents: 4500,
        sortOrder: 1,
        categories: { create: [{ categoryId: gelaatsverzorging.id }] },
      },
    }),
    prisma.service.create({
      data: {
        name: "Manicure",
        description: "Nagels vijlen, nagelriemen verzorgen en lakken naar keuze.",
        durationMinutes: 45,
        priceCents: 2500,
        sortOrder: 2,
        categories: { create: [{ categoryId: nagels.id }] },
      },
    }),
    prisma.service.create({
      data: {
        name: "Wenkbrauwen & wimpers verven",
        description: "Wenkbrauwen epileren en verven, wimpers verven.",
        durationMinutes: 30,
        priceCents: 2000,
        sortOrder: 3,
        categories: { create: [{ categoryId: wenkbrauwen.id }] },
      },
    }),
  ]);

  const huidverzorging = await prisma.productCategory.create({
    data: { name: "Huidverzorging" },
  });
  const lancome = await prisma.brand.create({ data: { name: "Lancôme" } });
  const ml = await prisma.contentUnit.create({ data: { name: "ml" } });

  await Promise.all([
    prisma.product.create({
      data: {
        name: "Hydraterende dagcrème",
        description: "Geschikt voor alle huidtypes.",
        priceCents: 1995,
        stockQuantity: 20,
        volume: 50,
        brandId: lancome.id,
        contentUnitId: ml.id,
        categories: { create: [{ categoryId: huidverzorging.id }] },
      },
    }),
    prisma.product.create({
      data: {
        name: "Milde reinigingsgel",
        description: "Parfumvrij.",
        priceCents: 1495,
        stockQuantity: 30,
        volume: 150,
        contentUnitId: ml.id,
        categories: { create: [{ categoryId: huidverzorging.id }] },
      },
    }),
  ]);
};

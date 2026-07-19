import { seedDev } from "./seedDev";
import { seedProd } from "./seedProd";
import prismaClient from "@/lib/server/dal/prismaClient";

const runtimeEnv = process.env.NODE_ENV ?? "development";
const seedFunction = runtimeEnv === "development" ? seedDev : seedProd;

seedFunction(prismaClient)
  .then(async () => {
    await prismaClient.$disconnect();
    console.log("Successfully seeded");
  })
  .catch(async (error) => {
    console.error(error);
    await prismaClient.$disconnect();
    process.exit(1);
  });

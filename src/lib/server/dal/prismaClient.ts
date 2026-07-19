import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

/**
 * Prisma 7 verbindt via een expliciete driver-adapter in plaats van een
 * `url` in schema.prisma (zie prisma/schema.prisma). We hergebruiken de
 * client over hot-reloads heen in dev, anders opent elke module-reload een
 * nieuwe connectie-pool naar Postgres.
 */
declare global {
  var __prismaClient: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.databaseUrl() });
  return new PrismaClient({ adapter });
}

const prismaClient = globalThis.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient = prismaClient;
}

export default prismaClient;

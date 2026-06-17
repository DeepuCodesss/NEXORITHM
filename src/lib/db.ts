import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { validateEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const getPrisma = () => {
  validateEnv();
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (databaseUrl.startsWith("file:")) {
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
    globalForPrisma.prisma ??= new PrismaClient({ adapter });
    return globalForPrisma.prisma;
  }

  globalForPrisma.prisma ??= new PrismaClient({ datasourceUrl: databaseUrl } as never);
  return globalForPrisma.prisma;
};

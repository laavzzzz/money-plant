import * as PrismaClientPkg from "@prisma/client";

const PrismaClient =
  (PrismaClientPkg as any).PrismaClient ??
  (PrismaClientPkg as any).default ??
  PrismaClientPkg;

// Global declaration allows us to attach Prisma to the global NodeJS scope 
// preventing multiple client instances during fast-refresh development.
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__gavoraPrisma ??
  new PrismaClient({
    log: process.env.LOG_LEVEL === 'debug' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__gavoraPrisma = prisma;
}

export async function getPrismaStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { state: 'connected', isConnected: true };
  } catch {
    return { state: 'disconnected', isConnected: false };
  }
}

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Prisma singleton.
 * - In dev: cache on globalThis so hot-reload doesn't leak connections.
 * - In prod: drop query logs (they stream every statement to stdout and cost
 *   meaningful throughput on busy boxes); keep warn/error only.
 * - Connection pool is sized via the `connection_limit` query param on
 *   DATABASE_URL (Prisma default = num_cpus * 2 + 1, which is fine for most
 *   deployments; raise it if you see pool timeouts under load).
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : process.env.PRISMA_QUIET === '1'
          ? ['warn', 'error']
          : ['query', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

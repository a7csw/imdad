import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import http from 'http';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { cache } from './middleware/cache';
import { publicLimiter, authLimiter, writeLimiter } from './middleware/rateLimit';
import { prisma } from './prisma/client';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import storeRoutes from './modules/stores/stores.routes';
import productRoutes from './modules/products/products.routes';
import categoryRoutes from './modules/categories/categories.routes';
import brandRoutes from './modules/brands/brands.routes';
import orderRoutes from './modules/orders/orders.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// ── Hardening & perf ────────────────────────────────────────
// Correctly infer client IP when running behind a reverse proxy / load balancer.
// This is required for rate limiting to bucket by real client IP (not the LB).
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.disable('etag'); // we emit our own cache headers on cached routes

// gzip compression — huge win for JSON responses; only compresses payloads > 1KB
app.use(
  compression({
    threshold: 1024,
    level: 6, // balanced CPU vs compression ratio
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Body parser limits — trimmed from 10mb; product payloads are small JSON.
// Uploads go through the dedicated /api/upload route (multer) separately.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Static Files ────────────────────────────────────────────
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    maxAge: '7d',
    immutable: true,
    etag: true,
  })
);

// ── Health ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, pid: process.pid });
});

// Deep health — verifies DB round-trip. Use for readiness probes.
app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

// ── API Routes ──────────────────────────────────────────────
// Auth has its own tighter limiter to prevent credential stuffing.
app.use('/api/auth', authLimiter, authRoutes);

// Public read-heavy routes get a short-TTL cache + public limiter.
// The cache middleware auto-bypasses for authenticated requests.
app.use('/api/categories', publicLimiter, cache(300), categoryRoutes); // 5 min
app.use('/api/brands', publicLimiter, cache(300), brandRoutes); // 5 min
app.use('/api/products', publicLimiter, cache(30), productRoutes); // 30 s
app.use('/api/stores', publicLimiter, cache(60), storeRoutes); // 1 min

// Write-dominant routes get the write limiter.
app.use('/api/users', writeLimiter, userRoutes);
app.use('/api/orders', writeLimiter, orderRoutes);
app.use('/api/upload', writeLimiter, uploadRoutes);

// ── Error Handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
const server = http.createServer(app);

// Raise keep-alive + headers timeout for high-throughput reverse-proxy setups.
// Defaults (5s / 60s) cause spurious 502s under sustained load.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

// Only listen if this file is the process entry point. When cluster.ts forks
// workers it requires this module — listening is deferred until here.
if (require.main === module || process.env.WORKER === '1') {
  server.listen(env.PORT, () => {
    console.log(`\n🚀 Imdad API running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}  PID: ${process.pid}\n`);
  });
}

// ── Graceful shutdown ───────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {
      console.error('Error disconnecting Prisma:', err);
    }
    process.exit(0);
  });
  // Hard exit safety net if close hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
export { server };

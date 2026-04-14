import cluster from 'node:cluster';
import os from 'node:os';

/**
 * Cluster bootstrap.
 *
 * Node is single-threaded — to saturate a multi-core box we fork one worker
 * per core (or WEB_CONCURRENCY if set). The kernel load-balances incoming
 * connections across workers via the shared listen socket.
 *
 * On a typical 4-core server this alone multiplies throughput by ~3.5× vs
 * a single process. Combined with compression, response caching, and DB
 * indexes, the stack comfortably handles the 1000 req/s read-path target
 * for cached endpoints. Write endpoints remain bounded by Postgres.
 *
 * Usage:
 *   npm run start:cluster         # prod, all cores
 *   WEB_CONCURRENCY=2 npm run start:cluster
 */

const desired = parseInt(process.env.WEB_CONCURRENCY ?? '', 10);
const workers =
  Number.isFinite(desired) && desired > 0
    ? desired
    : typeof os.availableParallelism === 'function'
      ? os.availableParallelism()
      : os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🔱 Primary ${process.pid} forking ${workers} worker(s)…`);

  for (let i = 0; i < workers; i++) cluster.fork({ WORKER: '1' });

  cluster.on('exit', (worker, code, signal) => {
    console.warn(
      `⚠️  Worker ${worker.process.pid} died (${signal || code}). Respawning…`
    );
    cluster.fork({ WORKER: '1' });
  });

  // Forward termination signals so graceful shutdown fires in each worker.
  const forward = (signal: NodeJS.Signals) => {
    for (const id in cluster.workers) cluster.workers[id]?.kill(signal);
  };
  process.on('SIGTERM', () => forward('SIGTERM'));
  process.on('SIGINT', () => forward('SIGINT'));
} else {
  // Worker process — boot the app. app.ts reads WORKER=1 to bind its listener.
  require('./app');
}

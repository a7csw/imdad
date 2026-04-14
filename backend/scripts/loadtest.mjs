#!/usr/bin/env node
/**
 * Load test harness — verifies the API can sustain the target 1000 req/s on
 * cached read endpoints.
 *
 * Usage:
 *   npm run loadtest                        # default: localhost:4000
 *   TARGET=http://localhost:4000 npm run loadtest
 *   CONN=200 DURATION=30 npm run loadtest
 *
 * What it measures:
 *   - Sustained throughput (req/s) for each public read endpoint.
 *   - Latency percentiles (p50, p95, p99).
 *   - Error count — should be 0 if rate limits and DB are healthy.
 *
 * Tuning knobs:
 *   CONN       number of concurrent TCP connections (default 100)
 *   PIPELINE   HTTP pipelining depth per connection (default 10)
 *   DURATION   seconds per scenario (default 20)
 *
 * Tips for hitting 1000 req/s locally:
 *   - Run the backend with `npm run start:cluster` (multi-core).
 *   - Warm the cache first — the first hit per endpoint goes to Postgres.
 *   - Bump the public rate limit in src/middleware/rateLimit.ts if your test
 *     client shares an IP with the server (rate limits will throttle you).
 */

import autocannon from 'autocannon';

const TARGET = process.env.TARGET ?? 'http://localhost:4000';
const CONNECTIONS = parseInt(process.env.CONN ?? '100', 10);
const PIPELINING = parseInt(process.env.PIPELINE ?? '10', 10);
const DURATION = parseInt(process.env.DURATION ?? '20', 10);

const scenarios = [
  { title: 'Health',      path: '/health' },
  { title: 'Categories',  path: '/api/categories' },
  { title: 'Brands',      path: '/api/brands' },
  { title: 'Product list', path: '/api/products?limit=24' },
  { title: 'Featured',    path: '/api/products?featured=true&limit=12' },
];

async function runScenario({ title, path }) {
  console.log(`\n▶ ${title}  →  ${TARGET}${path}`);
  const result = await autocannon({
    url: `${TARGET}${path}`,
    connections: CONNECTIONS,
    pipelining: PIPELINING,
    duration: DURATION,
    headers: { 'accept-encoding': 'gzip' },
  });
  console.log(autocannon.printResult(result));
  return { title, result };
}

(async () => {
  console.log(`\n⚙  Load test → ${TARGET}`);
  console.log(`   connections=${CONNECTIONS}  pipelining=${PIPELINING}  duration=${DURATION}s`);

  const summary = [];
  for (const s of scenarios) {
    summary.push(await runScenario(s));
  }

  console.log('\n━━━ Summary ━━━');
  for (const { title, result } of summary) {
    const rps = Math.round(result.requests.average);
    const p99 = result.latency.p99;
    const errors = result.errors + result.non2xx + result.timeouts;
    const verdict = rps >= 1000 ? '✅' : rps >= 500 ? '🟡' : '🔴';
    console.log(
      `${verdict}  ${title.padEnd(14)}  ${String(rps).padStart(6)} req/s   p99=${String(p99).padStart(5)}ms   errors=${errors}`
    );
  }
  console.log('');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

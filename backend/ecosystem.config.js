/**
 * PM2 ecosystem config — production process manager.
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload imdad-api      # zero-downtime reload
 *   pm2 logs imdad-api
 *
 * PM2 handles clustering (exec_mode: 'cluster') so Node's native cluster
 * module is optional here. If you deploy without PM2, use `npm run start:cluster`
 * which uses src/cluster.ts instead.
 */
module.exports = {
  apps: [
    {
      name: 'imdad-api',
      script: 'dist/app.js',
      exec_mode: 'cluster',
      instances: 'max', // one worker per CPU core
      max_memory_restart: '512M',
      kill_timeout: 10_000, // give the graceful-shutdown hook time to finish
      wait_ready: false,
      listen_timeout: 10_000,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        WORKER: '1',
      },
    },
  ],
};

import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env, isProduction } from './config/env.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

let server;
let shuttingDown = false;

async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`Shutting down (${reason})`);

  // Hard deadline so a stuck connection cannot keep the process alive forever.
  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      logger.info('HTTP server closed');
    }
    await disconnectDatabase();
    clearTimeout(forceExit);
    process.exit(exitCode);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
}

async function start() {
  // In development the server binds even if Mongo is unreachable, so the HTTP
  // layer stays testable while the connection retries in the background.
  const connected = await connectDatabase();
  if (!connected && !isProduction) {
    logger.warn('Starting HTTP server without a database connection (retrying in background)');
  }

  const app = createApp();

  server = app.listen(env.PORT, () => {
    logger.info(`Gavora API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${env.PORT} is already in use`);
      process.exit(1);
    }
    logger.error(`HTTP server error: ${error.message}`);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
  shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  shutdown('uncaughtException', 1);
});

start().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

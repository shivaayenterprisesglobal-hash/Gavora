import './config/dns.js';
import { createApp } from './app.js';
import { disconnectDatabase } from './config/db.js';
import { env, isProduction } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

let server;
let shuttingDown = false;

function maskDbError(error) {
  return String(error?.message || '').replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***@');
}

async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`Shutting down (${reason})`);

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
    await prisma.$disconnect();
    await disconnectDatabase();
    clearTimeout(forceExit);
    process.exit(exitCode);
  } catch (error) {
    logger.error(`Error during shutdown: ${maskDbError(error)}`);
    process.exit(1);
  }
}

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error(`PostgreSQL connection failed: ${maskDbError(error)}`);
    if (isProduction) {
      throw error;
    }
    logger.warn('Starting HTTP server without a database connection');
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
  logger.error(`Failed to start server: ${maskDbError(error)}`);
  process.exit(1);
});

import './dns.js';
import mongoose from 'mongoose';

import { env, isProduction } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_ATTEMPTS = isProduction ? 5 : Infinity;
const RETRY_BASE_MS = 2000;
const RETRY_MAX_MS = 30000;

let retryTimer = null;
let attempt = 0;

mongoose.set('strictQuery', true);
// Do not queue catalogue queries while Atlas is unreachable — fail the request
// so the storefront can leave the loading state instead of hanging on skeletons.
mongoose.set('bufferCommands', false);
if (!isProduction) mongoose.set('debug', env.LOG_LEVEL === 'debug');

mongoose.connection.on('connected', () => {
  attempt = 0;
  logger.info(`MongoDB connected: ${mongoose.connection.name}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error', error.message);
});

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized',
};

export function getDbStatus() {
  const state = mongoose.connection.readyState;
  return {
    state: CONNECTION_STATES[state] ?? 'unknown',
    isConnected: state === 1,
  };
}

/**
 * Connects to MongoDB with bounded exponential backoff.
 *
 * In production an exhausted retry budget is fatal — a server that cannot read
 * its own data should not accept traffic. In development we keep retrying in the
 * background so the HTTP layer stays testable before a URI is configured.
 */
export async function connectDatabase() {
  attempt += 1;

  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      autoIndex: !isProduction,
    });
    return true;
  } catch (error) {
    logger.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

    if (attempt >= MAX_ATTEMPTS) {
      throw new Error(`Could not connect to MongoDB after ${attempt} attempts`);
    }

    const delay = Math.min(RETRY_BASE_MS * 2 ** (attempt - 1), RETRY_MAX_MS);
    logger.warn(`Retrying MongoDB connection in ${delay / 1000}s`);

    retryTimer = setTimeout(() => {
      connectDatabase().catch((retryError) => {
        logger.error(`MongoDB retry failed: ${retryError.message}`);
        if (isProduction) process.exit(1);
      });
    }, delay);
    retryTimer.unref();

    return false;
  }
}

export async function disconnectDatabase() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
  }
}

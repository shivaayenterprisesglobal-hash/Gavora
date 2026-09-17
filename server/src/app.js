import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './config/cors.js';
import { isProduction, isTest } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { sanitizeRequest } from './middleware/sanitize.js';
import { verifyRequestOrigin } from './middleware/originCheck.js';
import { apiRouter } from './routes/index.js';
import { logger } from './utils/logger.js';

const clientDistDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
const clientIndexFile = path.join(clientDistDir, 'index.html');

function serveProductionClient(app) {
  const hasBuild = existsSync(clientIndexFile);

  if (!hasBuild) {
    logger.error(
      `Production client build not found at ${clientDistDir}. Run npm run build before starting.`,
    );
  } else {
    logger.info(`Serving storefront from ${clientDistDir}`);
  }

  // Hashed Vite assets. index.html is not auto-served so / still goes through
  // the SPA fallback below.
  app.use(express.static(clientDistDir, { index: false, fallthrough: true }));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    // API 404s must stay JSON. Never return the storefront for /api/*.
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    // Missing .js/.css should 404, not receive index.html.
    if (path.extname(req.path)) return next();
    if (!hasBuild) return next();
    return res.sendFile(clientIndexFile);
  });
}

export function createApp() {
  const app = express();

  // Required for correct client IPs (and therefore rate limiting) behind a
  // reverse proxy such as Nginx.
  app.set('trust proxy', isProduction ? 1 : false);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // CSP stays off: the storefront loads Google Fonts from index.html.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(cors(corsOptions));
  app.use(compression());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(sanitizeRequest);
  app.use(verifyRequestOrigin);

  if (!isTest) {
    app.use(
      morgan(isProduction ? 'combined' : 'dev', {
        stream: { write: (message) => logger.info(message.trim()) },
      }),
    );
  }

  app.use('/api', apiLimiter, apiRouter);

  if (isProduction) {
    serveProductionClient(app);
  }

  // Express 5 uses path-to-regexp v8, which rejects a bare '*' route pattern,
  // so the catch-all is registered as plain middleware.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

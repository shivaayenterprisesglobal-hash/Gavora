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
import { apiRouter } from './routes/index.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Required for correct client IPs (and therefore rate limiting) behind a
  // reverse proxy such as Nginx.
  app.set('trust proxy', isProduction ? 1 : false);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // The API serves JSON only; CSP belongs to whatever serves the client.
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

  if (!isTest) {
    app.use(
      morgan(isProduction ? 'combined' : 'dev', {
        stream: { write: (message) => logger.info(message.trim()) },
      }),
    );
  }

  app.use('/api', apiLimiter, apiRouter);

  // Express 5 uses path-to-regexp v8, which rejects a bare '*' route pattern,
  // so the catch-all is registered as plain middleware.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

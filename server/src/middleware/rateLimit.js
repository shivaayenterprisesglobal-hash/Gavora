import rateLimit from 'express-rate-limit';

import { env, isTest } from '../config/env.js';

const sharedOptions = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req, res, _next, options) =>
    res.status(options.statusCode).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
      },
    }),
};

/** Broad ceiling applied to the whole API surface. */
export const apiLimiter = rateLimit({
  ...sharedOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
});

/** Tight limit for credential endpoints to blunt brute-force attempts. */
export const authLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
});

import { env, isProduction } from './env.js';
import { ApiError } from '../utils/ApiError.js';

const allowlist = new Set([env.CLIENT_URL, ...env.CORS_ORIGINS]);

export const corsOptions = {
  origin(origin, callback) {
    // Same-origin requests and server-to-server tools (curl, health probes)
    // arrive without an Origin header.
    if (!origin) return callback(null, true);

    if (allowlist.has(origin)) return callback(null, true);

    // Outside production, allow any localhost port so a dev server on a
    // different port does not need a config change.
    if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(ApiError.forbidden(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
};

export const corsAllowlist = [...allowlist];

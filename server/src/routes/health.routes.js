import { Router } from 'express';

import { getDbStatus } from '../config/db.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

/**
 * Liveness + readiness in one probe. Returns 503 while the database is
 * unreachable so an orchestrator does not route traffic to a half-ready node.
 */
healthRouter.get('/', (_req, res) => {
  const db = getDbStatus();

  res.status(db.isConnected ? 200 : 503).json({
    success: db.isConnected,
    message: db.isConnected ? 'Gavora API is healthy' : 'Gavora API is running without a database',
    data: {
      service: 'gavora-api',
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: db,
    },
  });
});

export default healthRouter;

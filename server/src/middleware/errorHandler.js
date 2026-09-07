import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Translates any thrown value into the API's error envelope:
 * { success: false, error: { code, message, details? } }
 */
function normalize(error) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      code: error.code ?? 'ERROR',
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    const details = {};
    for (const issue of error.issues) {
      details[issue.path.join('.') || '(root)'] = issue.message;
    }
    return {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = {};
    for (const [field, issue] of Object.entries(error.errors)) {
      details[field] = issue.message;
    }
    return {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      code: 'INVALID_IDENTIFIER',
      message: `Invalid value for "${error.path}"`,
    };
  }

  // Duplicate key — surface which field collided, never the stored value.
  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern ?? error.keyValue ?? {});
    const label = fields.length > 0 ? fields.join(', ') : 'field';
    return {
      statusCode: 409,
      code: 'DUPLICATE_KEY',
      message: `A record with this ${label} already exists`,
      details: fields.length > 0 ? { [label]: 'already in use' } : undefined,
    };
  }

  if (error?.type === 'entity.parse.failed') {
    return { statusCode: 400, code: 'MALFORMED_JSON', message: 'Request body is not valid JSON' };
  }

  if (error?.type === 'entity.too.large') {
    return { statusCode: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' };
  }

  if (error?.name === 'JsonWebTokenError') {
    return { statusCode: 401, code: 'INVALID_TOKEN', message: 'Invalid authentication token' };
  }

  if (error?.name === 'TokenExpiredError') {
    return { statusCode: 401, code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' };
  }

  return {
    statusCode: error?.statusCode ?? 500,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
  };
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity (4 args).
export function errorHandler(error, req, res, next) {
  const { statusCode, code, message, details } = normalize(error);

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, error);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode} ${code}: ${message}`);
  }

  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;

  // Stack traces are a disclosure risk, so they are development-only.
  if (!isProduction && error instanceof Error) {
    body.error.stack = error.stack;
  }

  res.status(statusCode).json(body);
}

/**
 * Error type for every failure the API deliberately surfaces to a client.
 * `isOperational` distinguishes these from unexpected crashes so the error
 * handler knows whether the message is safe to return verbatim.
 */
export class ApiError extends Error {
  constructor(statusCode, message, { code = undefined, details = undefined } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Invalid request', options) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', ...options });
  }

  static unauthorized(message = 'Authentication required', options) {
    return new ApiError(401, message, { code: 'UNAUTHORIZED', ...options });
  }

  static forbidden(message = 'You do not have permission to perform this action', options) {
    return new ApiError(403, message, { code: 'FORBIDDEN', ...options });
  }

  static notFound(message = 'Resource not found', options) {
    return new ApiError(404, message, { code: 'NOT_FOUND', ...options });
  }

  static conflict(message = 'Resource already exists', options) {
    return new ApiError(409, message, { code: 'CONFLICT', ...options });
  }

  static unprocessable(message = 'Validation failed', options) {
    return new ApiError(422, message, { code: 'VALIDATION_ERROR', ...options });
  }

  static tooManyRequests(message = 'Too many requests, please try again later', options) {
    return new ApiError(429, message, { code: 'RATE_LIMITED', ...options });
  }

  static notImplemented(message = 'This endpoint is not implemented yet', options) {
    return new ApiError(501, message, { code: 'NOT_IMPLEMENTED', ...options });
  }

  static internal(message = 'Something went wrong', options) {
    return new ApiError(500, message, { code: 'INTERNAL_ERROR', ...options });
  }
}

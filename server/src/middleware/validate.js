import { ApiError } from '../utils/ApiError.js';

/**
 * Builds a middleware that validates the named request parts against zod
 * schemas and replaces them with the parsed result, so downstream handlers
 * receive coerced, whitelisted data rather than raw input.
 *
 * @param {{ body?: import('zod').ZodType, params?: import('zod').ZodType, query?: import('zod').ZodType }} schemas
 */
export function validate(schemas) {
  return (req, _res, next) => {
    const details = {};

    for (const part of ['body', 'params', 'query']) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = [part, ...issue.path].join('.');
          details[key] = issue.message;
        }
        continue;
      }

      // Express 5 exposes req.query as a getter, so it must be redefined.
      if (part === 'query') {
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        req[part] = result.data;
      }
    }

    if (Object.keys(details).length > 0) {
      return next(ApiError.unprocessable('Validation failed', { details }));
    }

    return next();
  };
}

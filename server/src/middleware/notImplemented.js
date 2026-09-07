import { ApiError } from '../utils/ApiError.js';

/**
 * Placeholder handler for endpoints whose contract is agreed but whose
 * implementation lands in a later phase. Keeps the route table complete and
 * verifiable without shipping fake behaviour.
 *
 * @param {string} description What the endpoint will do once implemented.
 */
export function notImplemented(description) {
  return (_req, _res, next) => {
    next(ApiError.notImplemented(`Not implemented yet: ${description}`));
  };
}

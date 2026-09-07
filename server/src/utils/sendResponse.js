/**
 * Single success envelope for every endpoint, so the client can rely on one
 * shape: { success, message, data, meta }.
 */
export function sendResponse(res, { statusCode = 200, message = 'OK', data = null, meta } = {}) {
  const body = { success: true, message, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendCreated(res, options = {}) {
  return sendResponse(res, { statusCode: 201, message: 'Created', ...options });
}

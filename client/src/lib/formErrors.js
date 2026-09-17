/**
 * Maps the API validation envelope (`error.details`) onto form field names.
 * Server keys are prefixed with the request part, e.g. `body.email`.
 */
export function mapApiFieldErrors(error) {
  const details = error?.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};

  const mapped = {};
  for (const [key, message] of Object.entries(details)) {
    const field = String(key).replace(/^(body|params|query)\./, '');
    mapped[field] = message;
  }
  return mapped;
}

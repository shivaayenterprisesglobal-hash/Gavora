import crypto from 'node:crypto';

/** Unique-looking order id, e.g. GV-20260908-A3F91C. Uniqueness is enforced by the index. */
export function generateOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `GV-${stamp}-${suffix}`;
}

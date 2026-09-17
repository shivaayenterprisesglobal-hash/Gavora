import { randomBytes } from 'node:crypto';

/** 24-character hex id, matching the existing ObjectId-shaped API contract. */
export function newHexId() {
  return randomBytes(12).toString('hex');
}

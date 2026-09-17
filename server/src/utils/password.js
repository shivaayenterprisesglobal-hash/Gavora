import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';

export function hashPassword(password) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

/**
 * Compares a candidate password against a stored hash. When no user exists a
 * dummy hash is still compared so the timing of a miss is closer to a miss on
 * the password itself.
 */
export async function verifyPassword(password, passwordHash) {
  const hash = passwordHash || '$2a$12$C6UzMDM.H6dfI/f/IKcEeO9pKqKqKqKqKqKqKqKqKqKqKqKqKqKq';
  return bcrypt.compare(password, hash);
}

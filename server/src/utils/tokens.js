import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

const UNIT_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function durationToMs(value, fallbackMs) {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(String(value ?? '').trim());
  if (!match) return fallbackMs;
  return Number(match[1]) * UNIT_MS[match[2].toLowerCase()];
}

export function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId), typ: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: String(userId), typ: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (payload.typ && payload.typ !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (payload.typ && payload.typ !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

/**
 * Stateless JWTs stay valid until expiry. After a password change we reject
 * any token whose `iat` is earlier than `passwordChangedAt` so other sessions
 * cannot keep using the old credentials.
 */
export function wasIssuedBeforePasswordChange(payload, passwordChangedAt) {
  if (!passwordChangedAt) return false;
  const changedAt = passwordChangedAt instanceof Date ? passwordChangedAt : new Date(passwordChangedAt);
  if (Number.isNaN(changedAt.getTime())) return false;
  const changedSec = Math.floor(changedAt.getTime() / 1000);
  return typeof payload.iat === 'number' && payload.iat < changedSec;
}

export const accessCookieMaxAge = durationToMs(env.JWT_ACCESS_EXPIRES, 15 * 60 * 1000);
export const refreshCookieMaxAge = durationToMs(env.JWT_REFRESH_EXPIRES, 30 * 24 * 60 * 60 * 1000);

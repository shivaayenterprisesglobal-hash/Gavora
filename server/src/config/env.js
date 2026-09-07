import { z } from 'zod';

const booleanFromString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const csvList = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

/**
 * Secrets must be long enough to be worth having. Enforcing this at startup
 * prevents a placeholder value from silently reaching production.
 */
const secret = (name) =>
  z
    .string()
    .min(32, `${name} must be at least 32 characters`)
    .refine((value) => !/^(change|replace|your|example|placeholder)/i.test(value), {
      message: `${name} still contains a placeholder value`,
    });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: csvList.default('http://localhost:5173'),

  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .refine((value) => /^mongodb(\+srv)?:\/\//.test(value), {
      message: 'MONGO_URI must start with mongodb:// or mongodb+srv://',
    }),

  JWT_ACCESS_SECRET: secret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: secret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),

  SHIPPING_FLAT_RATE: z.coerce.number().nonnegative().default(79),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().nonnegative().default(999),
  COD_ENABLED: booleanFromString.default('true'),
  COD_MAX_ORDER_VALUE: z.coerce.number().nonnegative().default(20000),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(300),
});

/**
 * Drops blank values so a commented-out or empty line in .env behaves as if the
 * variable were absent. Without this, `RAZORPAY_KEY_ID=` would read as the
 * empty string and fail validation instead of falling back to optional.
 */
function withoutBlanks(source) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => typeof value !== 'string' || value.trim() !== ''),
  );
}

function loadEnv() {
  const parsed = envSchema.safeParse(withoutBlanks(process.env));

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment configuration:\n${issues}\n\n` +
        'Copy server/.env.example to server/.env and fill in the required values.',
    );
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

/**
 * Razorpay is optional until the payments phase; this flag lets routes fail
 * with a clear message instead of crashing on a missing key.
 */
export const isRazorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

// Reads and checks the environment variables once, at startup.
// If something required is missing or too weak, the server stops with a clear
// message instead of failing later with a confusing error (audit M1-12).
// Secret values are never printed, only the variable names.
import { z } from 'zod';

const toOriginList = (value, ctx) => {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  const origins = [];
  for (const item of items) {
    let url;
    try {
      url = new URL(item);
    } catch {
      ctx.addIssue({ code: 'custom', message: `"${item}" is not a URL like http://127.0.0.1:5173` });
      return z.NEVER;
    }
    if (url.origin !== item) {
      ctx.addIssue({ code: 'custom', message: `"${item}" must be an origin only (no path, no trailing slash)` });
      return z.NEVER;
    }
    origins.push(url.origin);
  }
  if (origins.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'needs at least one origin' });
    return z.NEVER;
  }
  return origins;
};

// A 32-byte key written as base64 (44 characters). Used for CNIC encryption and hashing.
const key32 = z
  .string()
  .refine((s) => /^[A-Za-z0-9+/]{43}=$/.test(s) && Buffer.from(s, 'base64').length === 32, {
    message: 'must be 32 random bytes in base64 (see backend/.env.example for how to make one)',
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  // Local server listens only on this computer by default.
  HOST: z.string().min(1).default('127.0.0.1'),
  MONGO_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb:// or mongodb+srv://'),
  JWT_SECRET: z.string().min(32, 'must be at least 32 random characters'),
  CLIENT_ORIGIN: z.string().transform(toOriginList),
  CNIC_ENC_KEY: key32,
  CNIC_HASH_KEY: key32,
  // Number of proxies in front of the app (Vercel). 0 = none (local). Measured in Phase 8.
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  // Failed login/register attempts allowed per IP address per 15 minutes.
  AUTH_RATE_LIMIT: z.coerce.number().int().min(1).max(100000).default(10),
  // Evidence uploads allowed per IP address per 15 minutes.
  UPLOAD_RATE_LIMIT: z.coerce.number().int().min(1).max(100000).default(30),
  DB_TIMEOUT_MS: z.coerce.number().int().min(100).max(60000).default(5000),
});

// Pure function: easy to test with any object.
export function loadEnv(source = process.env) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || 'env'}: ${i.message}`);
    throw new Error(`Configuration error in environment variables (backend/.env):\n${lines.join('\n')}`);
  }
  if (result.data.CNIC_ENC_KEY === result.data.CNIC_HASH_KEY) {
    throw new Error('Configuration error: CNIC_ENC_KEY and CNIC_HASH_KEY must be two different keys.');
  }
  return Object.freeze(result.data);
}

let cached;
export function getEnv() {
  if (!cached) cached = loadEnv(process.env);
  return cached;
}

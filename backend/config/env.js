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
  // Number of proxies in front of the app. 0 = none (local); 1 on Vercel (required in production,
  // checked after deployment, docs/DEPLOY-RUNBOOK.md).
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  // 1 = /api/health also shows the caller their own IP as the server sees it (one-off check after
  // deployment; turn it off again). Never shows anyone else's data.
  SHOW_CLIENT_IP: z.enum(['0', '1']).default('0'),
  // Failed login/register attempts allowed per IP address per 15 minutes.
  AUTH_RATE_LIMIT: z.coerce.number().int().min(1).max(100000).default(10),
  // Evidence uploads allowed per IP address per 15 minutes.
  UPLOAD_RATE_LIMIT: z.coerce.number().int().min(1).max(100000).default(30),
  DB_TIMEOUT_MS: z.coerce.number().int().min(100).max(60000).default(5000),
});

// The live site (Vercel production, or NODE_ENV=production anywhere) gets stricter checks, so a
// half-configured deployment refuses to start instead of running with local or unsafe settings.
const isProduction = (source) => source.NODE_ENV === 'production' || source.VERCEL_ENV === 'production';
const LOCAL_MONGO = /^mongodb(\+srv)?:\/\/(?:[^@/]*@)?(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/;

function productionProblems(data, source) {
  const problems = [];
  if (source.VERCEL_ENV === 'production' && source.NODE_ENV !== 'production') {
    problems.push('NODE_ENV: must be "production" on the live site');
  }
  if (LOCAL_MONGO.test(data.MONGO_URI)) {
    problems.push('MONGO_URI: points at this computer; the live site needs the Atlas address (mongodb+srv://...)');
  }
  const notHttps = data.CLIENT_ORIGIN.filter((origin) => !origin.startsWith('https://'));
  if (notHttps.length) problems.push(`CLIENT_ORIGIN: the live site accepts https:// origins only (not ${notHttps.join(', ')})`);
  if (source.TRUST_PROXY === undefined || source.TRUST_PROXY === '') {
    problems.push('TRUST_PROXY: missing (required on the live site; 1 on Vercel)');
  }
  return problems;
}

function configError(source, lines) {
  const where = isProduction(source)
    ? 'on Vercel: Project -> Settings -> Environment Variables, then redeploy'
    : 'backend/.env';
  return new Error(`Configuration error: the server will not start. Fix these environment variables (${where}):\n${lines.map((l) => `  - ${l}`).join('\n')}`);
}

// Pure function: easy to test with any object. Secret values are never put into a message.
export function loadEnv(source = process.env) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => {
      const key = i.path.join('.') || 'env';
      const missing = source[key] === undefined || source[key] === '';
      return `${key}: ${missing ? 'missing (required)' : i.message}`;
    });
    throw configError(source, lines);
  }
  if (result.data.CNIC_ENC_KEY === result.data.CNIC_HASH_KEY) {
    throw configError(source, ['CNIC_ENC_KEY and CNIC_HASH_KEY must be two different keys']);
  }
  if (isProduction(source)) {
    const problems = productionProblems(result.data, source);
    if (problems.length) throw configError(source, problems);
  }
  return Object.freeze(result.data);
}

let cached;
export function getEnv() {
  if (!cached) cached = loadEnv(process.env);
  return cached;
}

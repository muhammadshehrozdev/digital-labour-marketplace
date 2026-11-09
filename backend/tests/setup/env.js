// Runs before every test file. Test-only settings: never the real .env, never Atlas.
// MONGO_URI points at a closed port on purpose; tests that need a database start an
// in-memory MongoDB (tests/helpers/testDb.js) and connect to it first.
const testEnv = {
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb://127.0.0.1:1/not-used-by-tests',
  JWT_SECRET: 'test-only-jwt-secret-0123456789-abcdefghijklmnop',
  CLIENT_ORIGIN: 'http://127.0.0.1:5173',
  // Fixed test keys (32 bytes each, base64). Not used anywhere else.
  CNIC_ENC_KEY: Buffer.alloc(32, 1).toString('base64'),
  CNIC_HASH_KEY: Buffer.alloc(32, 2).toString('base64'),
  AUTH_RATE_LIMIT: '100000',
  UPLOAD_RATE_LIMIT: '100000',
  DB_TIMEOUT_MS: '500',
};
for (const [key, value] of Object.entries(testEnv)) {
  if (process.env[key] === undefined || key === 'MONGO_URI' || key === 'NODE_ENV') process.env[key] = value;
}

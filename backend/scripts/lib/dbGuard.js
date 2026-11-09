// Shared safety check for scripts that WRITE data.
// Local database (127.0.0.1 / localhost): allowed.
// Any other host (Atlas): only with --allow-remote, which the team adds by hand after
// agreeing to run it (CLAUDE.md: ask before changing data in any real database).
export function dbHost(uri) {
  return String(uri).replace(/^mongodb(\+srv)?:\/\//, '').replace(/^[^@]*@/, '').split(/[/?]/)[0];
}

export function isLocalUri(uri) {
  return /^mongodb:\/\//.test(String(uri)) && /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(dbHost(uri));
}

export function checkWriteAllowed(uri, argv = process.argv) {
  if (!uri) return { ok: false, message: 'MONGO_URI is not set. Run this in the backend folder, where the .env file is.' };
  if (isLocalUri(uri) || argv.includes('--allow-remote')) return { ok: true, host: dbHost(uri) };
  return {
    ok: false,
    message: `Refusing: ${dbHost(uri)} is not this computer. Add --allow-remote only after the team agreed to change that database.`,
  };
}

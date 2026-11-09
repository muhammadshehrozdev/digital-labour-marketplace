// LOCAL PREVIEW ONLY: starts a MongoDB server on this computer for `npm run dev`.
// - Uses the same MongoDB program the tests use (downloaded into ../.local/mongodb-binaries,
//   see "config.mongodbMemoryServer" in package.json).
// - Keeps its data in ../.local/mongodb-data (gitignored), so data survives restarts.
// - Listens on 127.0.0.1 only: nothing outside this computer can connect.
// Never points at Atlas. Stop it with Ctrl+C.
// Run in .\backend:  npm run db:local
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoBinary } from 'mongodb-memory-server';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, '../../.local/mongodb-data');
const PORT = '27017';

mkdirSync(dataDir, { recursive: true });

// Finds the binary in the download folder (downloads it once if it is missing).
const mongodPath = await MongoBinary.getPath();
console.log(`MongoDB program: ${mongodPath}`);
console.log(`Data folder:     ${dataDir}`);
console.log(`Listening on:    mongodb://127.0.0.1:${PORT}  (Ctrl+C to stop)`);

const mongod = spawn(mongodPath, ['--dbpath', dataDir, '--port', PORT, '--bind_ip', '127.0.0.1', '--quiet'], {
  stdio: ['ignore', 'ignore', 'inherit'],
});

mongod.on('exit', (code) => {
  console.log(`MongoDB stopped (exit code ${code}).`);
  process.exit(code ?? 0);
});

// Pass Ctrl+C on to MongoDB so it shuts down cleanly.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => mongod.kill('SIGINT'));
}

// LOCAL DEMO ONLY: wipes the separate demo database and puts back a clean demo state with the three
// synthetic demo accounts, so the defence demo can be rehearsed again and again.
//
// - Works ONLY on a local database whose name ends in "_demo" (default mongodb://127.0.0.1:27017/dlm_demo).
//   The normal preview database (dlm_local_preview, with the team's own test accounts) is never touched.
// - The worker and customer come from seedLocalDemo.js; the admin comes from the create-admin script
//   (admins are created only by that script; the passphrase is piped in, which it allows for local
//   databases only).
//
// Run in ./backend (MongoDB must be running):  npm run demo:reset
// It asks you to type "yes"; add -- --yes to skip the question.
import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import Counter from '../models/Counter.js';
import Evidence from '../models/Evidence.js';
import EvidenceFile from '../models/EvidenceFile.js';
import Notification from '../models/Notification.js';
import ReasonTemplate from '../models/ReasonTemplate.js';
import SavedWorker from '../models/SavedWorker.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';

export const DEFAULT_DEMO_URI = 'mongodb://127.0.0.1:27017/dlm_demo';
export const DEMO_ADMIN = {
  name: 'Demo Admin (synthetic)',
  email: 'admin.demo@example.com',
  phone: '03000000003',
  passphrase: 'local admin demo passphrase', // local demo only
};

// Only a local mongodb:// address whose database name ends in "_demo".
export function checkDemoUri(uri) {
  const match = /^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/([A-Za-z0-9_-]+)(\?.*)?$/.exec(uri ?? '');
  if (!match) return 'the demo database must be a local mongodb://127.0.0.1 address with a database name';
  if (!match[3].endsWith('_demo')) return `the database name must end in "_demo" (got "${match[3]}")`;
  return null;
}

async function confirmed() {
  if (process.argv.includes('--yes')) return true;
  if (!process.stdin.isTTY) return false;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question('Type yes to wipe it and create the demo accounts: ', resolve));
  rl.close();
  return answer.trim() === 'yes';
}

// Runs another backend script against the demo database.
function runScript(file, args, input) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const result = spawnSync(process.execPath, [path.join(here, file), ...args], {
    cwd: path.resolve(here, '..'),
    env: { ...process.env, MONGO_URI: demoUri },
    input,
    stdio: [input === undefined ? 'ignore' : 'pipe', 'inherit', 'inherit'],
  });
  if (result.status !== 0) throw new Error(`${file} failed (exit code ${result.status})`);
}

const demoUri = process.env.DEMO_MONGO_URI || DEFAULT_DEMO_URI;

async function main() {
  const problem = checkDemoUri(demoUri);
  if (problem) {
    console.error(`Refusing to run: ${problem}.`);
    process.exit(1);
  }
  console.log(`Demo database: ${demoUri}`);
  console.log('Everything in it will be deleted (only synthetic demo data should ever be in it).');
  if (!(await confirmed())) {
    console.log('Stopped. Nothing was changed.');
    process.exit(0);
  }

  await mongoose.connect(demoUri, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();
  // The running backend built its indexes once at start; build them again on the empty database.
  for (const Model of [User, WorkerProfile, Evidence, EvidenceFile, AuditLog, Counter, Notification, ReasonTemplate, SavedWorker]) {
    await Model.createIndexes();
  }
  await mongoose.disconnect();
  console.log('Demo database wiped; indexes created.');

  runScript('seedLocalDemo.js', []);
  runScript('createAdmin.js', ['--name', DEMO_ADMIN.name, '--email', DEMO_ADMIN.email, '--phone', DEMO_ADMIN.phone], `${DEMO_ADMIN.passphrase}\n`);

  console.log('\nClean demo state ready (synthetic accounts, local only):');
  console.log('  worker    worker.demo@example.com    local-demo-password-123');
  console.log('  customer  customer.demo@example.com  local-demo-password-123');
  console.log(`  admin     ${DEMO_ADMIN.email}     ${DEMO_ADMIN.passphrase}`);
}

// Only when run as a script (the test imports checkDemoUri).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (err) => {
    console.error('Reset failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

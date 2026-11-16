// Rebuilds reputation snapshots (Module 4). Safe to run any number of times: it only recomputes the
// snapshot from the bookings and reviews already stored; it never changes a booking or a review.
// Run in .\backend:
//   npm run reputation:recompute -- --worker DLM-2026-000123
//   npm run reputation:recompute -- --all
// A database that is not on this computer is refused, unless --allow-remote is given AND you type
// "yes" after seeing its host name (team rule: ask before changing data in any real database).
import 'dotenv/config';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { checkWriteAllowed, isLocalUri } from './lib/dbGuard.js';
import { recomputeReputation } from '../services/reputation/recompute.js';

const WORKER_ID = /^DLM-\d{4}-\d{4,6}$/;

export function parseArgs(argv) {
  const i = argv.indexOf('--worker');
  const worker = i >= 0 ? argv[i + 1] : null;
  const all = argv.includes('--all');
  if (all === Boolean(worker)) return { error: 'Use exactly one of: --worker <workerIdCode>  or  --all' };
  if (worker && !WORKER_ID.test(worker)) return { error: 'The worker ID must look like DLM-2026-000123' };
  return { worker, all };
}

// For a remote database: show the host and ask for "yes". answer(question) returns the typed text.
export async function confirmRemote(uri, host, answer) {
  if (isLocalUri(uri)) return true;
  const typed = await answer(`This will rebuild reputation snapshots on ${host} (NOT this computer). Type yes to go on: `);
  return String(typed ?? '').trim() === 'yes';
}

function ask(question) {
  if (!process.stdin.isTTY) return Promise.resolve('');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (text) => { rl.close(); resolve(text); }));
}

export async function recompute({ worker, all }, now = new Date()) {
  let ids;
  if (worker) {
    const profile = await WorkerProfile.findOne({ workerIdCode: worker }).select('_id').lean();
    if (!profile) return { error: `No worker with ID ${worker}` };
    ids = [profile._id];
  } else {
    ids = await Booking.distinct('worker'); // workers without any booking have nothing to count
  }
  let done = 0;
  for (const id of ids) {
    await recomputeReputation(id, now);
    done += 1;
  }
  return { done };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.error) {
    console.error(args.error);
    process.exit(1);
  }
  const uri = process.env.MONGO_URI;
  const allowed = checkWriteAllowed(uri);
  if (!allowed.ok) {
    console.error(allowed.message);
    process.exit(1);
  }
  if (!(await confirmRemote(uri, allowed.host, ask))) {
    console.log('Stopped. Nothing was changed.');
    process.exit(0);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const result = await recompute(args);
  await mongoose.disconnect();
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(`Rebuilt ${result.done} reputation snapshot(s) on ${allowed.host}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (err) => {
    console.error('Recompute failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

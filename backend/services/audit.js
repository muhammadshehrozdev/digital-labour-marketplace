// Writes and checks the hash-chained audit log.
// hash = SHA-256( prevHash + canonical JSON of this entry's content )
// The first entry's prevHash is 64 zeros. Changing, inserting or deleting any entry
// breaks the chain from that point, and verifyAuditChain() reports where.
import { createHash } from 'node:crypto';
import AuditLog from '../models/AuditLog.js';

export const GENESIS_HASH = '0'.repeat(64);

// JSON with object keys sorted, so the same content always gives the same text.
function canonical(value) {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (typeof value === 'object') {
    if (typeof value.toHexString === 'function') return JSON.stringify(value.toHexString()); // ObjectId
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

const CONTENT_FIELDS = [
  'seq', 'actor', 'actorRole', 'action', 'targetType', 'targetId',
  'fromState', 'toState', 'reason', 'details', 'createdAt',
];

export function computeHash(entry) {
  const content = {};
  for (const field of CONTENT_FIELDS) content[field] = entry[field] ?? null;
  if (content.actor) content.actor = String(content.actor);
  return createHash('sha256').update(entry.prevHash).update(canonical(content)).digest('hex');
}

// Appends one entry.
// - Inside one server process, writes wait in a queue, one after another.
// - Across several server instances (Vercel), two writers cannot both take the same seq
//   (unique index): the loser waits a few random milliseconds and retries on the new last entry.
let queue = Promise.resolve();

export function writeAudit(entry) {
  const run = queue.then(() => appendEntry(entry));
  queue = run.catch(() => {}); // one failed write must not block the next ones
  return run;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function appendEntry({
  actor = null, actorRole = 'system', action, targetType = null, targetId = null,
  fromState = null, toState = null, reason = null, details = null,
}) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const last = await AuditLog.findOne().sort({ seq: -1 }).select('seq hash').lean();
    const entry = {
      seq: (last?.seq ?? 0) + 1,
      actor: actor ? String(actor) : null,
      actorRole,
      action,
      targetType,
      targetId: targetId === null ? null : String(targetId),
      fromState,
      toState,
      reason,
      details,
      createdAt: new Date(),
      prevHash: last?.hash ?? GENESIS_HASH,
    };
    entry.hash = computeHash(entry);
    try {
      return await AuditLog.create(entry);
    } catch (err) {
      if (err.code !== 11000) throw err;
      await pause(5 + Math.floor(Math.random() * 20));
    }
  }
  throw new Error('Could not write the audit log entry (too many concurrent writers)');
}

// Reads the whole chain in order and checks every link.
export async function verifyAuditChain() {
  let prevHash = GENESIS_HASH;
  let expectedSeq = 1;
  let count = 0;
  for await (const entry of AuditLog.find().sort({ seq: 1 }).lean().cursor()) {
    if (entry.seq !== expectedSeq) {
      return { ok: false, count, badSeq: entry.seq, problemCode: 'entry_missing', problem: `expected entry ${expectedSeq}, found ${entry.seq} (missing entry?)` };
    }
    if (entry.prevHash !== prevHash) {
      return { ok: false, count, badSeq: entry.seq, problemCode: 'link_broken', problem: 'prevHash does not match the previous entry' };
    }
    if (computeHash(entry) !== entry.hash) {
      return { ok: false, count, badSeq: entry.seq, problemCode: 'content_changed', problem: 'content was changed after it was written' };
    }
    prevHash = entry.hash;
    expectedSeq += 1;
    count += 1;
  }
  return { ok: true, count };
}

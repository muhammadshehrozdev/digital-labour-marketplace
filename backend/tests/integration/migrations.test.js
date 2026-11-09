// Phase 3 data migrations (run on a real database only after the team agrees).
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import WorkerProfile from '../../models/WorkerProfile.js';
import { migrateCnic, migrateCategories } from '../../scripts/lib/migrations.js';
import { checkWriteAllowed } from '../../scripts/lib/dbGuard.js';
import { decryptCnic, hashCnic } from '../../services/cnic.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';

beforeAll(startTestDb);
afterAll(stopTestDb);

const oid = () => new mongoose.Types.ObjectId();

describe('scripts/lib/dbGuard.js', () => {
  test('local URIs are allowed; Atlas is refused unless --allow-remote', () => {
    expect(checkWriteAllowed('mongodb://127.0.0.1:27017/x', []).ok).toBe(true);
    expect(checkWriteAllowed('mongodb://localhost/x', []).ok).toBe(true);
    const atlas = 'mongodb+srv://user:secret@cluster0.abcde.mongodb.net/db';
    const refused = checkWriteAllowed(atlas, []);
    expect(refused.ok).toBe(false);
    expect(refused.message).not.toContain('secret'); // never print the password
    expect(checkWriteAllowed(atlas, ['--allow-remote']).ok).toBe(true);
  });
});

describe('migrateCnic', () => {
  test('dry run changes nothing; apply encrypts valid numbers and removes all plain text', async () => {
    const col = WorkerProfile.collection;
    const userA = oid();
    await col.insertMany([
      { user: userA, workerIdCode: 'DLM-2026-0001', cnicNumber: '37405-1234567-1' },
      { user: oid(), workerIdCode: 'DLM-2026-0002', cnicNumber: '' },
      { user: oid(), workerIdCode: 'DLM-2026-0003', cnicNumber: 'abc' },
      { user: oid(), workerIdCode: 'DLM-2026-0004', cnicNumber: '3740512345671' }, // same CNIC as A
    ]);

    const dry = await migrateCnic({ apply: false });
    expect(dry).toMatchObject({ found: 4, encrypted: 1, emptyRemoved: 1, invalidRemoved: 1, duplicateSkipped: 1 });
    expect(await col.countDocuments({ cnicNumber: { $exists: true } })).toBe(4);

    const applied = await migrateCnic({ apply: true });
    expect(applied.encrypted).toBe(1);
    const a = await col.findOne({ user: userA });
    expect(a.cnicNumber).toBeUndefined();
    expect(a.cnicOnFile).toBe(true);
    expect(a.cnicHash).toBe(hashCnic('3740512345671'));
    expect(decryptCnic(a.cnicEncrypted, userA)).toBe('3740512345671');
    // Only the duplicate is left for an admin to resolve by hand.
    expect(await col.countDocuments({ cnicNumber: { $exists: true } })).toBe(1);
  });
});

describe('migrateCategories', () => {
  test('labels become ids; "Cleaning & Shifting" -> Domestic Work (D-012, counted); unknown ("None") -> null', async () => {
    const col = WorkerProfile.collection;
    await col.insertMany([
      { user: oid(), workerIdCode: 'DLM-2026-0011', category: 'Plumbing & Sanitary' },
      { user: oid(), workerIdCode: 'DLM-2026-0012', category: 'None' },
      { user: oid(), workerIdCode: 'DLM-2026-0013', category: 'domestic_work' },
      { user: oid(), workerIdCode: 'DLM-2026-0014', category: 'Cleaning & Shifting' },
      { user: oid(), workerIdCode: 'DLM-2026-0015', category: 'cleaning_shifting' },
    ]);
    expect(await migrateCategories({ apply: false })).toMatchObject({
      checked: 4, converted: 1, cleaningShiftingToDomestic: 2, unknownSetToNull: 1,
    });
    await migrateCategories({ apply: true });
    expect((await col.findOne({ workerIdCode: 'DLM-2026-0011' })).category).toBe('plumbing_sanitary');
    expect((await col.findOne({ workerIdCode: 'DLM-2026-0012' })).category).toBeNull();
    expect((await col.findOne({ workerIdCode: 'DLM-2026-0013' })).category).toBe('domestic_work');
    expect((await col.findOne({ workerIdCode: 'DLM-2026-0014' })).category).toBe('domestic_work');
    expect((await col.findOne({ workerIdCode: 'DLM-2026-0015' })).category).toBe('domestic_work');
  });
});

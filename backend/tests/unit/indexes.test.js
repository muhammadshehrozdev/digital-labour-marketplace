// The indexes the Batch 4 review asked for exist in the schemas (review R-04, R-05).
import { describe, test, expect } from 'vitest';
import AuditLog from '../../models/AuditLog.js';
import User from '../../models/User.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import Notification from '../../models/Notification.js';
import SavedWorker from '../../models/SavedWorker.js';

const keysOf = (model) => model.schema.indexes().map(([keys]) => JSON.stringify(keys));

describe('indexes', () => {
  test('audit log: by actor and by action, newest first', () => {
    expect(keysOf(AuditLog)).toEqual(expect.arrayContaining([JSON.stringify({ actor: 1, seq: -1 }), JSON.stringify({ action: 1, seq: -1 })]));
  });
  test('users: role + status for the admin Users page', () => {
    expect(keysOf(User)).toContain(JSON.stringify({ role: 1, status: 1, createdAt: -1 }));
  });
  test('worker profiles: identity queue and the directory sort keys', () => {
    expect(keysOf(WorkerProfile)).toEqual(expect.arrayContaining([
      JSON.stringify({ verificationStatus: 1, identityRequestedAt: 1 }),
      JSON.stringify({ approvedEvidenceCount: -1, _id: -1 }),
      JSON.stringify({ experienceYears: -1, _id: -1 }),
    ]));
  });
  test('notifications expire after 180 days; saved workers are unique per customer', () => {
    const ttl = Notification.schema.indexes().find(([keys, options]) => keys.createdAt === 1 && options.expireAfterSeconds);
    expect(ttl[1].expireAfterSeconds).toBe(180 * 24 * 60 * 60);
    const unique = SavedWorker.schema.indexes().find(([keys]) => keys.customer === 1 && keys.profile === 1);
    expect(unique[1].unique).toBe(true);
  });
});

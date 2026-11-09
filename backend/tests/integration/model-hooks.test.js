// Phase 1: proves both pre('save') hooks still run on Mongoose 9
// (Mongoose 9 removed `next()` from middleware; neither hook uses it).
// Uses an in-memory MongoDB — never Atlas.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../../models/User.js';
import WorkerProfile from '../../models/WorkerProfile.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

describe('User pre-save hook (async, no next)', () => {
  test('hashes the password when it is set', async () => {
    const user = await User.create({
      name: 'Test Worker',
      email: 'hook-test@example.com',
      password: 'plain-text-password',
      phone: '03000000000',
    });
    expect(user.password).not.toBe('plain-text-password');
    expect(await bcrypt.compare('plain-text-password', user.password)).toBe(true);
  });

  test('does not hash again when another field changes', async () => {
    const user = await User.findOne({ email: 'hook-test@example.com' });
    const hashBefore = user.password;
    user.name = 'Renamed Worker';
    await user.save();
    expect(user.password).toBe(hashBefore);
  });
});

describe('WorkerProfile pre-save hook (sync, no next)', () => {
  test('gives a new profile a worker ID code', async () => {
    const user = await User.findOne({ email: 'hook-test@example.com' });
    const profile = await WorkerProfile.create({ user: user._id });
    // Phase 3 (M1-8): atomic counter format DLM-<year>-<6 digits>.
    expect(profile.workerIdCode).toMatch(/^DLM-\d{4}-\d{6}$/);
  });
});

// Starts a private in-memory MongoDB for one test file and connects Mongoose to it.
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

export async function startTestDb() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  // Build unique indexes now, so duplicate tests are reliable.
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

export async function stopTestDb() {
  await mongoose.disconnect();
  await mongo?.stop();
}

export async function clearTestDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

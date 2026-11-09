// Converts old Module 2 skill data to the one skills array (audit M2-10).
// Run in .\backend:
//   npm run migrate:skills              (dry run: only counts, changes nothing)
//   npm run migrate:skills -- --apply   (changes the data)
// Refuses any non-local database unless --allow-remote is added (ask the team first).
import 'dotenv/config';
import mongoose from 'mongoose';
import { checkWriteAllowed } from './lib/dbGuard.js';
import { migrateSkills } from './lib/migrations.js';

const uri = process.env.MONGO_URI;
const guard = checkWriteAllowed(uri);
if (!guard.ok) {
  console.error(guard.message);
  process.exit(1);
}
const apply = process.argv.includes('--apply');
console.log(`Database host: ${guard.host}. Mode: ${apply ? 'APPLY (writes)' : 'dry run (no writes)'}`);
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.table(await migrateSkills({ apply }));
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

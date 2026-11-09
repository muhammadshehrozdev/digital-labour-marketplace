// Converts old category labels to taxonomy ids (audit M1-16).
// Run in .\backend:
//   npm run migrate:categories              (dry run: only counts, changes nothing)
//   npm run migrate:categories -- --apply   (changes the data)
// Refuses any non-local database unless --allow-remote is added (ask the team first).
import 'dotenv/config';
import mongoose from 'mongoose';
import { checkWriteAllowed } from './lib/dbGuard.js';
import { migrateCategories } from './lib/migrations.js';

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
  console.table(await migrateCategories({ apply }));
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

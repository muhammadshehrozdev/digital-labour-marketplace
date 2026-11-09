// READ-ONLY: checks the audit log hash chain in the database named by MONGO_URI.
// Run in .\backend:   npm run audit:verify
// Exit code 0 = chain intact, 1 = tampering or a problem was found.
import 'dotenv/config';
import mongoose from 'mongoose';
import { verifyAuditChain } from '../services/audit.js';

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Run this in the backend folder, where the .env file is.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, autoIndex: false, autoCreate: false });
  const result = await verifyAuditChain();
  if (result.ok) {
    console.log(`Audit log OK: ${result.count} entries, hash chain intact.`);
  } else {
    console.error(`Audit log PROBLEM at entry ${result.badSeq}: ${result.problem}. Entries checked before it: ${result.count}.`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error('Could not check the audit log:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

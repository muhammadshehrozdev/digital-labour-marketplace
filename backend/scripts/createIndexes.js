// Builds every index of every collection (unique email, worker ID, audit sequence, ...) in the database
// named by MONGO_URI. Safe to run any number of times: it only adds missing indexes and never changes or
// deletes data. Used once on the new, empty production database before the first admin is created
// (docs/DEPLOY-RUNBOOK.md); the app would also build them on first use, but then the first requests could
// race the build.
// Run in ./backend:  npm run db:indexes
import 'dotenv/config';
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
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import ReputationFlag from '../models/ReputationFlag.js';
import PriceGuide from '../models/PriceGuide.js'; // Module 5 (Batch 7)

const MODELS = [User, WorkerProfile, Evidence, EvidenceFile, AuditLog, Counter, Notification, ReasonTemplate, SavedWorker, Booking, Review, ReputationFlag, PriceGuide];
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set.');
  process.exit(1);
}
const host = uri.replace(/^mongodb(\+srv)?:\/\//, '').replace(/^[^@]*@/, '').split(/[/?]/)[0];
console.log(`Database host: ${host}`);
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, autoIndex: false });
  for (const Model of MODELS) {
    await Model.createIndexes();
    const names = (await Model.collection.indexes()).map((i) => i.name);
    console.log(`  ${Model.collection.collectionName}: ${names.length} indexes`);
  }
  console.log('All indexes are in place.');
} catch (err) {
  console.error('Could not build the indexes:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

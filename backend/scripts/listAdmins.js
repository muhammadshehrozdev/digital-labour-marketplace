// READ-ONLY: lists the admin accounts in the database named by MONGO_URI in backend/.env.
// It never writes anything: automatic index/collection creation is switched off,
// and the only database command is a find(). Passwords are never selected.
//
// Run from the backend folder:   node scripts/listAdmins.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Run this from the backend folder, where the .env file is.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: false, // do not build indexes on the real database
    autoCreate: false, // do not create collections on the real database
    serverSelectionTimeoutMS: 10000,
  });

  const admins = await User.find({ role: 'admin' })
    .select('name email createdAt')
    .sort({ createdAt: 1 })
    .lean();

  console.log(`Admin accounts found: ${admins.length}`);
  console.table(
    admins.map((a) => ({
      id: String(a._id),
      name: a.name,
      email: a.email,
      created: a.createdAt ? a.createdAt.toISOString() : 'unknown',
    }))
  );
} catch (err) {
  console.error('Could not list admins:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

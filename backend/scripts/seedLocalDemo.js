// LOCAL PREVIEW ONLY: creates dummy (synthetic) accounts in the LOCAL database.
// Refuses to run unless MONGO_URI points at this computer, so it can never touch Atlas.
// No admin is created here: admins come only from the create-admin script (Phase 3).
// Run in .\backend (with `npm run db:local` running):  npm run seed:local
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';

const uri = process.env.MONGO_URI || '';
const host = uri.replace(/^mongodb:\/\//, '').split(/[/:?]/)[0];
if (!uri.startsWith('mongodb://') || !['127.0.0.1', 'localhost'].includes(host)) {
  console.error('Refusing to run: MONGO_URI must be a local mongodb://127.0.0.1 address.');
  process.exit(1);
}

// Synthetic demo data — not real people. Passwords are for the local preview only.
const DEMO_PASSWORD = 'local-demo-password-123';
const demoUsers = [
  { name: 'Demo Worker (synthetic)', email: 'worker.demo@example.com', phone: '03000000001', role: 'worker' },
  { name: 'Demo Customer (synthetic)', email: 'customer.demo@example.com', phone: '03000000002', role: 'customer' },
];

await mongoose.connect(uri);
for (const data of demoUsers) {
  let user = await User.findOne({ email: data.email });
  if (user) {
    console.log(`exists:  ${data.email} (${data.role})`);
  } else {
    user = await User.create({ ...data, password: DEMO_PASSWORD });
    console.log(`created: ${data.email} (${data.role})`);
  }
  if (data.role === 'worker' && !(await WorkerProfile.exists({ user: user._id }))) {
    await WorkerProfile.create({
      user: user._id,
      occupation: 'Electrician',
      category: 'electrical_solar',
      skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', addedVia: 'manual' }],
      experienceYears: 3,
      hourlyRate: 500,
      dailyRate: 3000,
      city: 'Islamabad',
      bio: 'Synthetic demo profile for the local preview.',
    });
    console.log('created: worker profile for worker.demo@example.com');
  }
}
console.log(`Password for both demo accounts: ${DEMO_PASSWORD}`);
await mongoose.disconnect();

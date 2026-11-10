// Before the e2e run: empty the e2e database and create the e2e admin (synthetic).
// Safety: only a database on this computer whose name ends in "_e2e" is ever emptied.
import mongoose from '../../backend/node_modules/mongoose/index.js';
import { createAdminAccount } from '../../backend/services/adminAccounts.js';
import { E2E_ADMIN } from './accounts.js';

const uri = process.env.E2E_MONGO_URI || 'mongodb://127.0.0.1:27017/dlm_e2e';

export default async function globalSetup() {
  const { hostname, pathname } = new URL(uri.replace(/^mongodb(\+srv)?:/, 'http:'));
  const dbName = pathname.replace('/', '');
  if (!['127.0.0.1', 'localhost'].includes(hostname) || !dbName.endsWith('_e2e')) {
    throw new Error(`Refusing to reset ${hostname}/${dbName}: e2e uses only a local database named *_e2e`);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();
  const made = await createAdminAccount(E2E_ADMIN);
  await mongoose.disconnect();
  if (!made.ok) throw new Error(`e2e admin not created: ${made.message}`);
}

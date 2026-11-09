// Creates ONE admin account. This is the only way to make an admin (public registration
// accepts only worker or customer).
//
// Run in .\backend:
//   npm run create-admin -- --name "Admin Name" --email admin@example.com --phone 03001234567
// The password is asked for twice and is not shown while you type.
// (Or pipe it in: the first line of standard input is used as the password.)
//
// It prints which database host it will write to. For any host that is not this computer
// it asks you to type "yes" first.
import 'dotenv/config';
import readline from 'node:readline';
import mongoose from 'mongoose';
import { createAdminAccount } from '../services/adminAccounts.js';

function arg(nameToFind) {
  const index = process.argv.indexOf(`--${nameToFind}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function dbHost(uri) {
  return uri.replace(/^mongodb(\+srv)?:\/\//, '').replace(/^[^@]*@/, '').split(/[/?]/)[0];
}

// Ask a question; if hidden, do not echo what is typed.
function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function readPipedLine() {
  const rl = readline.createInterface({ input: process.stdin });
  for await (const line of rl) {
    rl.close();
    return line;
  }
  return '';
}

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set. Run this in the backend folder, where the .env file is.');
  process.exit(1);
}

const input = { name: arg('name'), email: arg('email'), phone: arg('phone') };
if (!input.name || !input.email || !input.phone) {
  console.error('Usage: npm run create-admin -- --name "Full Name" --email you@example.com --phone 03001234567');
  process.exit(1);
}

const host = dbHost(uri);
const isLocal = /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host);
console.log(`Database host: ${host}${isLocal ? ' (this computer)' : ' (NOT this computer)'}`);

if (process.stdin.isTTY) {
  if (!isLocal && (await ask('This is a remote database. Type yes to continue: ')) !== 'yes') {
    console.log('Stopped. Nothing was changed.');
    process.exit(0);
  }
  input.password = await ask('Password (at least 15 characters): ', { hidden: true });
  if ((await ask('Type the password again: ', { hidden: true })) !== input.password) {
    console.error('The two passwords are different. Nothing was changed.');
    process.exit(1);
  }
} else {
  if (!isLocal) {
    console.error('Refusing: piped input is only allowed for a local database.');
    process.exit(1);
  }
  input.password = await readPipedLine();
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const result = await createAdminAccount(input);
  if (result.ok) {
    console.log(`Admin created: ${result.email} (id ${result.id}). An audit log entry was written.`);
  } else {
    console.error(`Not created: ${result.message}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error('Could not create the admin:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

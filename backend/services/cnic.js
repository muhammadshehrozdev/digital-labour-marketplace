// CNIC protection (decision D-007, CNIC Option 2). Uses only Node's built-in crypto.
// - encryptCnic: AES-256-GCM with CNIC_ENC_KEY. A new random 12-byte IV every time.
//   The owner's user id is bound in as "additional data", so an encrypted CNIC copied
//   onto another account fails to decrypt.
// - hashCnic: HMAC-SHA256 with CNIC_HASH_KEY. The same CNIC always gives the same hash,
//   so a unique index stops one CNIC being used for two accounts, without storing the number.
// Never log a CNIC, and never put one in the audit log.
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import { getEnv } from '../config/env.js';

const VERSION = 'v1'; // lets us rotate keys later (v2 = new key)

const encKey = () => Buffer.from(getEnv().CNIC_ENC_KEY, 'base64');
const hashKey = () => Buffer.from(getEnv().CNIC_HASH_KEY, 'base64');

// "12345-1234567-1" or "1234512345671" -> "1234512345671"; anything else -> null.
export function normalizeCnic(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{5}-?\d{7}-?\d$/.test(trimmed)) return null;
  return trimmed.replace(/-/g, '');
}

export function formatCnic(digits) {
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function hashCnic(digits) {
  return createHmac('sha256', hashKey()).update(digits, 'utf8').digest('hex');
}

export function encryptCnic(digits, ownerId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encKey(), iv);
  cipher.setAAD(Buffer.from(String(ownerId), 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(digits, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

// Throws if the value was changed, belongs to another owner, or uses an unknown key version.
export function decryptCnic(stored, ownerId) {
  const [version, iv, tag, ciphertext] = String(stored).split('.');
  if (version !== VERSION || !iv || !tag || !ciphertext) throw new Error('Unknown CNIC encryption format');
  const decipher = createDecipheriv('aes-256-gcm', encKey(), Buffer.from(iv, 'base64url'));
  decipher.setAAD(Buffer.from(String(ownerId), 'utf8'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}

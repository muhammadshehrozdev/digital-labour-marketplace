// CNIC Option 2 (D-007): AES-256-GCM encryption + HMAC hash. Pure functions, no database.
import { describe, test, expect } from 'vitest';
import { normalizeCnic, formatCnic, hashCnic, encryptCnic, decryptCnic } from '../../services/cnic.js';

const OWNER = '65f000000000000000000001';
const CNIC = '3740512345671'; // synthetic test number

describe('services/cnic.js', () => {
  test('normalize accepts 12345-1234567-1 and 13 digits, rejects anything else', () => {
    expect(normalizeCnic('37405-1234567-1')).toBe(CNIC);
    expect(normalizeCnic(' 3740512345671 ')).toBe(CNIC);
    for (const bad of ['abc', '37405-1234567', '37405-1234567-12', '', null, 123, { $ne: 1 }]) {
      expect(normalizeCnic(bad)).toBeNull();
    }
    expect(formatCnic(CNIC)).toBe('37405-1234567-1');
  });

  test('encrypt -> decrypt gives the number back; the stored text does not contain it', () => {
    const stored = encryptCnic(CNIC, OWNER);
    expect(stored.startsWith('v1.')).toBe(true);
    expect(stored).not.toContain(CNIC);
    expect(decryptCnic(stored, OWNER)).toBe(CNIC);
  });

  test('two encryptions of the same number differ (random IV)', () => {
    expect(encryptCnic(CNIC, OWNER)).not.toBe(encryptCnic(CNIC, OWNER));
  });

  test('a ciphertext copied to another account, or changed by one character, fails to decrypt', () => {
    const stored = encryptCnic(CNIC, OWNER);
    expect(() => decryptCnic(stored, '65f000000000000000000002')).toThrow();
    const parts = stored.split('.');
    const last = parts[3];
    parts[3] = (last[0] === 'A' ? 'B' : 'A') + last.slice(1);
    expect(() => decryptCnic(parts.join('.'), OWNER)).toThrow();
  });

  test('hash: same CNIC -> same hash, different CNIC -> different hash, hash is not the number', () => {
    expect(hashCnic(CNIC)).toBe(hashCnic(CNIC));
    expect(hashCnic(CNIC)).not.toBe(hashCnic('3740512345672'));
    expect(hashCnic(CNIC)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashCnic(CNIC)).not.toContain(CNIC);
  });
});

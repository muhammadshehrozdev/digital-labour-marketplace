// Shared validation pieces (zod). Every request body, query and URL parameter is
// checked with schemas built from these (CLAUDE.md security rules).
import { z } from 'zod';

// Escape every RegExp special character so user text is matched literally (audit M1-3).
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\\-/]/g, '\\$&');

export const name = z
  .string({ error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name must be at most 60 characters');

export const email = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(254, 'Email is too long')
  .pipe(z.email({ error: 'Email address is not valid' }));

// Pakistani mobile number: 03XXXXXXXXX or +923XXXXXXXXX (spaces and dashes allowed).
// Saved in one form: 03XXXXXXXXX.
export const phone = z
  .string({ error: 'Phone number is required' })
  .trim()
  .max(20, 'Phone number is too long')
  .transform((s) => s.replace(/[\s-]/g, '').replace(/^(\+92|0092)/, '0'))
  .pipe(z.string().regex(/^03\d{9}$/, 'Phone must be a Pakistani mobile number like 0300 1234567'));

export const optionalPhone = z.union([z.literal(''), phone]);

// Password policy (decision D-005): at least 15 characters, at most 72 bytes
// (bcrypt ignores anything after 72 bytes), no "must contain a symbol" rules.
export const PASSWORD_MIN_CHARS = 15;
export const PASSWORD_MAX_BYTES = 72;
export const newPassword = z
  .string({ error: 'Password is required' })
  .refine((pw) => [...pw].length >= PASSWORD_MIN_CHARS, {
    message: `Password must be at least ${PASSWORD_MIN_CHARS} characters. Tip: use 4 or more easy words with spaces, in Roman Urdu or English`,
  })
  .refine((pw) => Buffer.byteLength(pw, 'utf8') <= PASSWORD_MAX_BYTES, {
    message: `Password is too long (max ${PASSWORD_MAX_BYTES} bytes; an Urdu letter counts as 2 bytes)`,
  })
  .refine((pw) => pw.trim().length > 0, { message: 'Password cannot be only spaces' });

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

// CNIC: 13 digits, written #####-#######-# (dashes optional). Returns the 13 digits.
export const cnic = z
  .string({ error: 'CNIC must be text' })
  .trim()
  .max(20, 'CNIC must look like 12345-1234567-1')
  .refine((s) => /^\d{5}-?\d{7}-?\d$/.test(s), { message: 'CNIC must look like 12345-1234567-1' })
  .transform((s) => s.replace(/-/g, ''));

// Query-string number (query values always arrive as text).
export const queryInt = (min, max) =>
  z
    .string()
    .regex(/^\d{1,6}$/, 'must be a whole number')
    .transform(Number)
    .pipe(z.number().int().min(min).max(max));

// Shared validation pieces (zod). Every request body, query and URL parameter is
// checked with schemas built from these (CLAUDE.md security rules).
// Messages are error CODES from errors/catalog.js (English text and translations live there
// and in the website's dictionaries). middleware/validate.js adds {field}, {min}, {max}.
import { z } from 'zod';
import { LANGUAGES } from '../config/languages.js';
import { TEXT_SIZES, THEME_PREFERENCES } from '../config/preferences.js';

// Escape every RegExp special character so user text is matched literally (audit M1-3).
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\\-/]/g, '\\$&');

export const name = z
  .string({ error: 'NAME_REQUIRED' })
  .trim()
  .min(2, 'TEXT_TOO_SHORT')
  .max(60, 'TEXT_TOO_LONG');

export const email = z
  .string({ error: 'EMAIL_REQUIRED' })
  .trim()
  .toLowerCase()
  .max(254, 'TEXT_TOO_LONG')
  .pipe(z.email({ error: 'EMAIL_INVALID' }));

// Pakistani mobile number: 03XXXXXXXXX or +923XXXXXXXXX (spaces and dashes allowed).
// Saved in one form: 03XXXXXXXXX.
export const phone = z
  .string({ error: 'PHONE_REQUIRED' })
  .trim()
  .max(20, 'TEXT_TOO_LONG')
  .transform((s) => s.replace(/[\s-]/g, '').replace(/^(\+92|0092)/, '0'))
  .pipe(z.string().regex(/^03\d{9}$/, 'PHONE_INVALID'));

// Website language (Batch 3): en, ur or ur-Latn.
export const preferredLanguage = z.enum(LANGUAGES, { error: 'LANGUAGE_INVALID' });
// Display settings (Batch 4): light / dark / system, and the text size.
export const preferredTheme = z.enum(THEME_PREFERENCES, { error: 'THEME_INVALID' });
export const preferredTextSize = z.enum(TEXT_SIZES, { error: 'TEXT_SIZE_INVALID' });

export const optionalPhone = z.union([z.literal(''), phone]);

// Password policy (decision D-005): at least 15 characters, at most 72 bytes
// (bcrypt ignores anything after 72 bytes), no "must contain a symbol" rules.
export const PASSWORD_MIN_CHARS = 15;
export const PASSWORD_MAX_BYTES = 72;
export const newPassword = z
  .string({ error: 'PASSWORD_REQUIRED' })
  .refine((pw) => [...pw].length >= PASSWORD_MIN_CHARS, { message: 'PASSWORD_TOO_SHORT' })
  .refine((pw) => Buffer.byteLength(pw, 'utf8') <= PASSWORD_MAX_BYTES, { message: 'PASSWORD_TOO_LONG' })
  .refine((pw) => pw.trim().length > 0, { message: 'PASSWORD_ONLY_SPACES' });

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'ID_INVALID');

// CNIC: 13 digits, written #####-#######-# (dashes optional). Returns the 13 digits.
export const cnic = z
  .string({ error: 'TEXT_MUST_BE_TEXT' })
  .trim()
  .max(20, 'CNIC_INVALID')
  .refine((s) => /^\d{5}-?\d{7}-?\d$/.test(s), { message: 'CNIC_INVALID' })
  .transform((s) => s.replace(/-/g, ''));

// Query-string number (query values always arrive as text).
export const queryInt = (min, max) =>
  z
    .string({ error: 'ONE_VALUE' })
    .regex(/^\d{1,6}$/, 'WHOLE_NUMBER')
    .transform(Number)
    .pipe(z.number().int().min(min).max(max));

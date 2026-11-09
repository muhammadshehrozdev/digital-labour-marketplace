import { z } from 'zod';
import { name, email, phone, newPassword, PASSWORD_MAX_BYTES } from './common.js';

// Public registration: only worker or customer (audit M1-1). Admins come only from
// scripts/createAdmin.js. Unknown keys are rejected (.strict()).
export const registerSchema = z
  .object({
    name,
    email,
    password: newPassword,
    phone,
    role: z.enum(['worker', 'customer'], { error: 'Role must be worker or customer' }).default('worker'),
  })
  .strict();

// Login does not apply the new length rule (older accounts may have shorter passwords),
// but it still rejects non-strings and values bcrypt cannot handle.
export const loginSchema = z
  .object({
    email,
    password: z
      .string({ error: 'Password is required' })
      .min(1, 'Password is required')
      .refine((pw) => Buffer.byteLength(pw, 'utf8') <= PASSWORD_MAX_BYTES, { message: 'Password is too long' }),
  })
  .strict();

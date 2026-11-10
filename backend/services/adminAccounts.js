// Creating an admin account. Used ONLY by scripts/createAdmin.js (never by an API route).
import { z } from 'zod';
import User from '../models/User.js';
import { name, email, phone, newPassword } from '../validators/common.js';
import { writeAudit } from './audit.js';
import { fieldLabel, formatError, isErrorCode } from '../errors/catalog.js';

export const adminInputSchema = z.object({ name, email, phone, password: newPassword }).strict();

export async function createAdminAccount(input) {
  const parsed = adminInputSchema.safeParse(input);
  if (!parsed.success) {
    // Validator messages are error codes; the script shows their English text.
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${isErrorCode(i.message) ? formatError(i.message, { field: fieldLabel(String(i.path[0])), min: i.minimum, max: i.maximum }) : i.message}`)
      .join('; ');
    return { ok: false, message };
  }
  const data = parsed.data;
  if (await User.exists({ email: data.email })) {
    return { ok: false, message: 'An account with this email already exists. No change was made.' };
  }
  const admin = await User.create({ ...data, role: 'admin' });
  await writeAudit({
    action: 'admin.created',
    targetType: 'User',
    targetId: admin._id,
    toState: 'admin',
    details: { via: 'scripts/createAdmin.js' },
  });
  return { ok: true, id: String(admin._id), email: admin.email };
}

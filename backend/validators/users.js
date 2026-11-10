// Settings of the logged-in user (Batch 3 and 4). Unknown keys are rejected (.strict()).
// Any of the three settings may be sent; at least one is needed.
import { z } from 'zod';
import { preferredLanguage, preferredTextSize, preferredTheme } from './common.js';

export const preferencesSchema = z
  .object({
    preferredLanguage: preferredLanguage.optional(),
    preferredTheme: preferredTheme.optional(),
    preferredTextSize: preferredTextSize.optional(),
  })
  .strict()
  .refine((body) => Object.values(body).some((value) => value !== undefined), { message: 'PREFERENCES_EMPTY' });

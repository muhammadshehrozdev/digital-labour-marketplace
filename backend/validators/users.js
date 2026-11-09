// Settings of the logged-in user (Batch 3). Unknown keys are rejected (.strict()).
import { z } from 'zod';
import { preferredLanguage } from './common.js';

export const preferencesSchema = z.object({ preferredLanguage }).strict();

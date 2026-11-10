// A reusable reason an admin can insert into a decision note (Batch 4, feature 29).
// One text per website language; English is required, the other two are optional.
import mongoose from 'mongoose';
import { LANGUAGES } from '../config/languages.js';

// Where a template can be used.
export const TEMPLATE_KINDS = Object.freeze([
  'identity_verify', 'identity_reject', 'evidence_reject', 'evidence_fake', 'evidence_revoke', 'user_suspend', 'user_reactivate',
]);
export const MAX_TEMPLATES = 60;
export const TEMPLATE_TEXT_MAX = 300;

const text = { type: String, trim: true, maxlength: TEMPLATE_TEXT_MAX, default: '' };

const reasonTemplateSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, enum: TEMPLATE_KINDS },
    // Keys are the language codes of config/languages.js ('ur-Latn' is a valid key in MongoDB).
    text: {
      en: { ...text, required: true, minlength: 5 },
      ur: text,
      'ur-Latn': text,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false }
);

reasonTemplateSchema.index({ kind: 1, createdAt: 1 });

export const TEMPLATE_LANGUAGES = LANGUAGES;
export default mongoose.model('ReasonTemplate', reasonTemplateSchema);

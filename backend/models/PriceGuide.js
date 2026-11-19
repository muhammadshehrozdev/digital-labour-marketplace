// The admin price guide (Module 5, decision D-072): the FALLBACK price information, used only when no
// platform range exists. Typed by an admin, always WITH A WRITTEN SOURCE (`sourceNote`, for example "Team
// survey of 6 electricians in G-9, Nov 2026"). Production starts EMPTY: no code or script creates production
// entries; the local demo seed creates entries labelled "[Demo]" with synthetic: true.
// One ACTIVE entry per skill (or none = the whole category), category, unit and region. Every change is
// audited (priceguide.created / .updated / .archived, with the old and new numbers).
import mongoose from 'mongoose';
import { CATEGORY_IDS, SKILL_IDS } from '../config/skillTaxonomy.js';
import { COUNTRY, REGION_CODES } from '../config/regions.js';
import { UNITS } from '../config/workTerms.js';
import { GUIDE_NOTE_MAX, GUIDE_SOURCE_MAX, GUIDE_SOURCE_MIN, WAGE_RULES } from '../config/wageRules.js';

export const GUIDE_REGIONS = Object.freeze([...REGION_CODES, COUNTRY]);
export const GUIDE_STATUSES = Object.freeze(['active', 'archived']);
const rupees = { type: Number, required: true, min: 1, max: WAGE_RULES.AMOUNT_MAX, validate: { validator: Number.isInteger, message: 'whole rupees' } };

const priceGuideSchema = new mongoose.Schema(
  {
    skillId: { type: String, enum: [...SKILL_IDS, null], default: null }, // null = the whole trade category
    category: { type: String, enum: CATEGORY_IDS, required: true },
    unit: { type: String, enum: UNITS, required: true },
    region: { type: String, enum: GUIDE_REGIONS, required: true }, // a region code, or PK for all of Pakistan
    low: rupees,
    high: rupees,
    sourceNote: { type: String, required: true, trim: true, minlength: GUIDE_SOURCE_MIN, maxlength: GUIDE_SOURCE_MAX },
    note: { type: String, trim: true, maxlength: GUIDE_NOTE_MAX, default: '' }, // shown to users
    status: { type: String, enum: GUIDE_STATUSES, default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    archivedAt: { type: Date, default: null },
    synthetic: { type: Boolean, default: false }, // demo data only
  },
  { timestamps: true }
);

priceGuideSchema.pre('validate', function lowNotAboveHigh() {
  if (Number.isFinite(this.low) && Number.isFinite(this.high) && this.low > this.high) this.invalidate('low', 'low must not be above high');
});

// one active entry per key (archived entries are kept as history)
priceGuideSchema.index({ skillId: 1, category: 1, unit: 1, region: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
priceGuideSchema.index({ status: 1, category: 1, updatedAt: -1 });

export default mongoose.model('PriceGuide', priceGuideSchema);

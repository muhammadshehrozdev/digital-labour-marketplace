// Database reads for the Module 5 price information (the engines stay pure: these functions only load plain
// data and hand it to priceRange). One query per estimate, on the price-statistics indexes of models/Booking.js.
import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import PriceGuide from '../../models/PriceGuide.js';
import { COUNTRY } from '../../config/regions.js';
import { WAGE_RULES } from '../../config/wageRules.js';
import { CATEGORY_UNITS, priceRange } from './priceRange.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const trusted = (value) => mongoose.trusted(value);
export const PRICE_JOB_FIELDS = '_id worker customer skillId category region city status completedAt completionMethod terms.agreed.unit terms.agreed.amount';

// The filter of the one query. A whole job is compared within its skill; a day or an hour may fall back to the
// trade category, so for those the query loads the whole category (the skill's jobs are inside it).
export function priceJobsFilter({ skillId, category, unit }, now, params = WAGE_RULES) {
  const filter = {
    status: 'completed',
    'terms.agreed.unit': unit,
    completedAt: trusted({ $gte: new Date(now.getTime() - params.PRICE_WINDOW_DAYS * DAY_MS), $lte: now }),
  };
  if ((CATEGORY_UNITS.includes(unit) && category) || !skillId) filter.category = category;
  else filter.skillId = skillId;
  return filter;
}

const toJob = (b) => ({
  bookingId: String(b._id),
  workerId: String(b.worker),
  customerId: String(b.customer),
  skillId: b.skillId,
  category: b.category,
  region: b.region ?? null,
  city: b.city,
  status: b.status,
  completedAt: b.completedAt,
  completionMethod: b.completionMethod,
  agreed: b.terms?.agreed ? { unit: b.terms.agreed.unit, amount: b.terms.agreed.amount } : null,
});

// The platform range for a query (or null). Never returns a list, an id or a name.
export async function platformRange(query, now) {
  if (!query.unit || (!query.skillId && !query.category)) return null;
  const docs = await Booking.find(priceJobsFilter(query, now)).select(PRICE_JOB_FIELDS).lean();
  return priceRange(docs.map(toJob), query, { now });
}

// The platform range for the current terms of a booking (for its checks), or null.
export function rangeForBooking(b, now) {
  const unit = b.terms?.unit;
  if (!unit || (b.terms?.status ?? 'none') === 'none') return null;
  return platformRange({ skillId: b.skillId, category: b.category, unit, city: b.city, region: b.region ?? null }, now);
}

const guideView = (g) => ({
  scope: g.skillId ? 'skill' : 'category',
  skillId: g.skillId ?? null,
  category: g.category,
  unit: g.unit,
  region: g.region,
  low: g.low,
  high: g.high,
  sourceNote: g.sourceNote,
  note: g.note ?? '',
  updatedAt: g.updatedAt,
});

// The admin guide, used only when no platform range exists. Order: the skill in the region, the skill in all
// of Pakistan, the category in the region, the category in all of Pakistan.
export async function guideFor({ skillId, category, unit, region }) {
  if (!category || !unit) return null;
  const regions = [...new Set([region, COUNTRY].filter(Boolean))];
  const found = await PriceGuide.find({
    status: 'active', unit, category,
    skillId: trusted({ $in: [...new Set([skillId ?? null, null])] }),
    region: trusted({ $in: regions }),
  }).lean();
  const order = [[skillId, region], [skillId, COUNTRY], [null, region], [null, COUNTRY]].filter(([s, r]) => r && (s === null || s));
  for (const [s, r] of order) {
    const hit = found.find((g) => (g.skillId ?? null) === (s ?? null) && g.region === r);
    if (hit) return guideView(hit);
  }
  return null;
}

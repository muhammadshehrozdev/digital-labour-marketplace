// Module 5 (Batch 7), admin only: the price guide (the fallback price information, always with a written source)
// and the read-only Payments page (Module 9 will decide payment disputes; here they are only marked and shown).
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import Booking from '../models/Booking.js';
import PriceGuide from '../models/PriceGuide.js';
import User from '../models/User.js';
import { httpError } from '../utils/httpError.js';
import { writeAudit } from '../services/audit.js';
import { bookingView } from '../services/booking/views.js';
import { peopleFor } from './bookingsController.js';

const trusted = (value) => mongoose.trusted(value);
const NUMBERS = ['low', 'high', 'sourceNote', 'note', 'status'];
const numbersOf = (g) => ({ low: g.low, high: g.high, region: g.region, unit: g.unit, skillId: g.skillId ?? null, category: g.category, status: g.status });

const guideView = (g, names) => ({
  _id: g._id, skillId: g.skillId ?? null, category: g.category, unit: g.unit, region: g.region, low: g.low, high: g.high,
  sourceNote: g.sourceNote, note: g.note ?? '', status: g.status, synthetic: Boolean(g.synthetic),
  createdAt: g.createdAt, updatedAt: g.updatedAt, archivedAt: g.archivedAt ?? null,
  createdBy: names.get(String(g.createdBy)) ?? '', updatedBy: g.updatedBy ? names.get(String(g.updatedBy)) ?? '' : '',
});

// GET /api/admin/price-guides?status=&category= — the entries, and each one's change history from the audit log
export const listPriceGuides = async (req, res) => {
  const { status = 'active', category } = req.validated.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (category) filter.category = category;
  const guides = await PriceGuide.find(filter).sort({ status: 1, category: 1, updatedAt: -1 }).limit(500).lean();
  const ids = guides.map((g) => String(g._id));
  const audit = ids.length
    ? await AuditLog.find({ targetType: 'PriceGuide', targetId: trusted({ $in: ids }) }).sort({ seq: -1 }).limit(2000).select('action actor targetId details createdAt').lean()
    : [];
  const people = [...new Set([...guides.flatMap((g) => [g.createdBy, g.updatedBy]), ...audit.map((a) => a.actor)].filter(Boolean).map(String))];
  const names = new Map((await User.find({ _id: trusted({ $in: people }) }).select('name').lean()).map((u) => [String(u._id), u.name]));
  const history = {};
  for (const a of audit) (history[a.targetId] ??= []).push({ action: a.action, at: a.createdAt, by: names.get(String(a.actor)) ?? '', before: a.details?.before ?? null, after: a.details?.after ?? null });
  res.set('Cache-Control', 'no-store');
  res.json({ guides: guides.map((g) => guideView(g, names)), history });
};

// POST /api/admin/price-guides — a new entry, only with a written source
export const createPriceGuide = async (req, res) => {
  const body = req.validated.body;
  let guide;
  try {
    guide = await PriceGuide.create({ ...body, skillId: body.skillId ?? null, note: body.note ?? '', status: 'active', createdBy: req.user._id });
  } catch (err) {
    if (err.code === 11000) throw httpError(409, 'PRICE_GUIDE_EXISTS');
    throw err;
  }
  await writeAudit({
    actor: req.user._id, actorRole: 'admin', action: 'priceguide.created', targetType: 'PriceGuide', targetId: guide._id, toState: 'active',
    reason: `Price guide entry created (${guide.category}, ${guide.unit}, ${guide.region})`, details: { before: null, after: numbersOf(guide) },
  });
  const names = new Map([[String(req.user._id), req.user.name]]);
  res.status(201).json({ guide: guideView(guide.toObject(), names) });
};

// PATCH /api/admin/price-guides/:id — new numbers with a source, or { status: 'archived' }
export const updatePriceGuide = async (req, res) => {
  const { id } = req.validated.params;
  const body = req.validated.body;
  const before = await PriceGuide.findById(id).lean();
  if (!before) throw httpError(404, 'PRICE_GUIDE_NOT_FOUND');
  if (before.status !== 'active') throw httpError(409, 'PRICE_GUIDE_ARCHIVED');
  const archive = body.status === 'archived';
  const set = archive
    ? { status: 'archived', archivedAt: new Date(), updatedBy: req.user._id }
    : { ...Object.fromEntries(NUMBERS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]])), updatedBy: req.user._id };
  // conditional on the version that was read, so two admins at once cannot overwrite each other silently
  const updated = await PriceGuide.findOneAndUpdate({ _id: id, status: 'active', updatedAt: before.updatedAt }, { $set: set }, { returnDocument: 'after', runValidators: true }).lean();
  if (!updated) throw httpError(409, 'PRICE_GUIDE_CHANGED');
  await writeAudit({
    actor: req.user._id, actorRole: 'admin', action: archive ? 'priceguide.archived' : 'priceguide.updated', targetType: 'PriceGuide', targetId: updated._id,
    fromState: before.status, toState: updated.status,
    reason: `Price guide entry ${archive ? 'archived' : 'updated'} (${updated.category}, ${updated.unit}, ${updated.region})`,
    details: { before: numbersOf(before), after: numbersOf(updated) },
  });
  const names = new Map((await User.find({ _id: trusted({ $in: [updated.createdBy, updated.updatedBy].filter(Boolean) }) }).select('name').lean()).map((u) => [String(u._id), u.name]));
  res.json({ guide: guideView(updated, names) });
};

// GET /api/admin/payments?state=&page= — bookings by payment state, disputed first. Read-only.
export const listPayments = async (req, res) => {
  const now = new Date();
  const { state = 'all', page = 1, limit = 20 } = req.validated.query;
  const match = state === 'all'
    ? { $or: [{ paymentState: trusted({ $ne: 'no_price' }) }, { 'payments.0': trusted({ $exists: true }) }] }
    : state === 'no_price' ? { paymentState: 'no_price', 'payments.0': trusted({ $exists: true }) } : { paymentState: state };
  const [items, total, disputed] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      { $addFields: { disputedFirst: { $cond: [{ $eq: ['$paymentState', 'has_dispute'] }, 0, 1] } } },
      { $sort: { disputedFirst: 1, updatedAt: -1, _id: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]),
    Booking.countDocuments(match),
    Booking.countDocuments({ paymentState: 'has_dispute' }),
  ]);
  const people = await peopleFor(items);
  res.set('Cache-Control', 'no-store');
  res.json({
    bookings: items.map((b) => bookingView(b, { viewer: 'admin', now, people: people(b), detail: true })),
    counts: { disputed },
    page, limit, total,
  });
};

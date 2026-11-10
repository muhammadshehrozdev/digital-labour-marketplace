// Admin overview data (Batch 4): charts from real counts (feature 27), waiting times (28) and the
// audit-chain check (32). Nothing here is estimated: every number is a count from the database.
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import Evidence from '../models/Evidence.js';
import { CATEGORY_IDS } from '../config/skillTaxonomy.js';
import { EVIDENCE_STATUSES } from '../config/evidence.js';
import { verifyAuditChain } from '../services/audit.js';

// Days are counted in Pakistan time (UTC+5, no daylight saving), the project's users' day.
export const CHART_TIMEZONE = 'Asia/Karachi';
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// 'YYYY-MM-DD' of a moment, in Pakistan time.
export const pktDay = (date) => new Date(date.getTime() + PKT_OFFSET_MS).toISOString().slice(0, 10);

// How long items have been waiting, in four buckets.
export function waitingBuckets(dates, now = new Date()) {
  const buckets = { under1Day: 0, days1to3: 0, days4to7: 0, over7Days: 0, oldest: null };
  for (const date of dates) {
    if (!date) continue;
    const days = (now.getTime() - new Date(date).getTime()) / DAY_MS;
    if (days < 1) buckets.under1Day += 1;
    else if (days < 4) buckets.days1to3 += 1;
    else if (days < 8) buckets.days4to7 += 1;
    else buckets.over7Days += 1;
    if (!buckets.oldest || new Date(date) < new Date(buckets.oldest)) buckets.oldest = date;
  }
  return buckets;
}

// GET /api/admin/charts?days=30
export const getCharts = async (req, res) => {
  const days = req.validated.query.days ?? 30;
  const now = new Date();
  // midnight (Pakistan time) of the first day shown
  const firstDay = pktDay(new Date(now.getTime() - (days - 1) * DAY_MS));
  const since = new Date(new Date(`${firstDay}T00:00:00.000Z`).getTime() - PKT_OFFSET_MS);

  const [registered, identityByStatus, pendingIdentity, evidenceByStatus, pendingEvidence, skillsByCategory] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: since }, role: { $in: ['worker', 'customer'] } } },
      { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: CHART_TIMEZONE } }, role: '$role' }, n: { $sum: 1 } } },
    ]),
    WorkerProfile.aggregate([{ $group: { _id: '$verificationStatus', n: { $sum: 1 } } }]),
    WorkerProfile.find({ verificationStatus: 'Pending' }).select('identityRequestedAt updatedAt').lean(),
    Evidence.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Evidence.find({ status: 'pending' }).select('createdAt').lean(),
    WorkerProfile.aggregate([{ $unwind: '$skills' }, { $group: { _id: '$skills.category', n: { $sum: 1 } } }]),
  ]);

  // every day of the range is present, also the days with no registrations
  const byDay = new Map();
  for (let i = 0; i < days; i += 1) {
    const date = pktDay(new Date(since.getTime() + i * DAY_MS + PKT_OFFSET_MS / 2));
    byDay.set(date, { date, worker: 0, customer: 0 });
  }
  for (const row of registered) {
    const day = byDay.get(row._id.day);
    if (day && row._id.role in day) day[row._id.role] = row.n;
  }

  const identityCounts = { Unverified: 0, Pending: 0, Verified: 0, Rejected: 0 };
  for (const row of identityByStatus) if (row._id in identityCounts) identityCounts[row._id] = row.n;
  const evidenceCounts = Object.fromEntries(EVIDENCE_STATUSES.map((s) => [s, 0]));
  for (const row of evidenceByStatus) if (row._id in evidenceCounts) evidenceCounts[row._id] = row.n;
  const categoryCounts = new Map(skillsByCategory.map((row) => [row._id, row.n]));

  res.set('Cache-Control', 'no-store');
  res.json({
    days,
    timezone: CHART_TIMEZONE,
    generatedAt: now,
    registrations: [...byDay.values()],
    identity: { counts: identityCounts, waiting: waitingBuckets(pendingIdentity.map((p) => p.identityRequestedAt ?? p.updatedAt), now) },
    evidence: { counts: evidenceCounts, waiting: waitingBuckets(pendingEvidence.map((e) => e.createdAt), now) },
    skillsByCategory: CATEGORY_IDS.map((category) => ({ category, count: categoryCounts.get(category) ?? 0 })),
  });
};

// GET /api/admin/audit/verify — the same check as `npm run audit:verify`, for the overview widget.
export const verifyAudit = async (req, res) => {
  const result = await verifyAuditChain();
  res.set('Cache-Control', 'no-store');
  res.json({ ...result, checkedAt: new Date() });
};

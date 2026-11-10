// A customer's saved workers (Batch 4, feature 23). Customer only; a customer sees and changes
// only their own list. Cards use the same public field list as the directory.
import mongoose from 'mongoose';
import SavedWorker, { MAX_SAVED_WORKERS } from '../models/SavedWorker.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { httpError } from '../utils/httpError.js';
import { hideSuspendedWorkers } from '../services/accountStatus.js';
import { PUBLIC_WORKER_FIELDS, PUBLIC_USER_FIELDS, LISTED_FILTER } from './workersController.js';

// A worker a customer may see: listed in the directory and not suspended.
async function findListedProfile(workerIdCode) {
  const filter = await hideSuspendedWorkers({ ...LISTED_FILTER(), workerIdCode });
  return WorkerProfile.findOne(filter).select('_id workerIdCode').lean();
}

// GET /api/saved — newest first. Workers who were suspended or removed are left out.
export const listSaved = async (req, res) => {
  const rows = await SavedWorker.find({ customer: req.user._id }).sort({ createdAt: -1, _id: -1 }).select('profile createdAt').lean();
  const filter = await hideSuspendedWorkers({ ...LISTED_FILTER(), _id: mongoose.trusted({ $in: rows.map((r) => r.profile) }) });
  const profiles = await WorkerProfile.find(filter).select(PUBLIC_WORKER_FIELDS).populate('user', PUBLIC_USER_FIELDS).lean();
  const byId = new Map(profiles.map((p) => [String(p._id), p]));
  const workers = rows.map((r) => byId.get(String(r.profile))).filter(Boolean).map(({ _id, ...rest }) => rest);
  res.set('Cache-Control', 'no-store');
  res.json({ workers, total: workers.length, max: MAX_SAVED_WORKERS });
};

// GET /api/saved/ids — only the worker IDs, for the heart buttons on the search page.
export const listSavedIds = async (req, res) => {
  const rows = await SavedWorker.find({ customer: req.user._id }).select('profile').lean();
  const profiles = await WorkerProfile.find({ _id: mongoose.trusted({ $in: rows.map((r) => r.profile) }) }).select('workerIdCode').lean();
  res.set('Cache-Control', 'no-store');
  res.json({ ids: profiles.map((p) => p.workerIdCode), max: MAX_SAVED_WORKERS });
};

// PUT /api/saved/:workerIdCode — save (doing it twice is fine).
export const saveWorker = async (req, res) => {
  const profile = await findListedProfile(req.validated.params.workerIdCode);
  if (!profile) throw httpError(404, 'WORKER_NOT_FOUND');
  const already = await SavedWorker.exists({ customer: req.user._id, profile: profile._id });
  if (!already) {
    if ((await SavedWorker.countDocuments({ customer: req.user._id })) >= MAX_SAVED_WORKERS) throw httpError(400, 'SAVED_LIMIT', { max: MAX_SAVED_WORKERS });
    try {
      await SavedWorker.create({ customer: req.user._id, profile: profile._id });
    } catch (err) {
      if (err.code !== 11000) throw err; // two taps at the same time: one row is enough
    }
  }
  res.status(already ? 200 : 201).json({ saved: true, workerIdCode: profile.workerIdCode });
};

// DELETE /api/saved/:workerIdCode — remove (also fine if it was not saved).
export const unsaveWorker = async (req, res) => {
  const profile = await WorkerProfile.findOne({ workerIdCode: req.validated.params.workerIdCode }).select('_id workerIdCode').lean();
  if (profile) await SavedWorker.deleteOne({ customer: req.user._id, profile: profile._id });
  res.json({ saved: false, workerIdCode: req.validated.params.workerIdCode });
};

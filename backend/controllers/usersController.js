// Settings of the logged-in user, for every role (Batch 3: language; Batch 4: theme, text size).
import User from '../models/User.js';

// PATCH /api/users/me/preferences  (body checked by preferencesSchema)
// Only the settings that were sent are changed; the answer repeats exactly those.
export const updateMyPreferences = async (req, res) => {
  const changes = Object.fromEntries(Object.entries(req.validated.body).filter(([, value]) => value !== undefined));
  await User.updateOne({ _id: req.user._id }, { $set: changes }, { runValidators: true });
  res.json(changes);
};

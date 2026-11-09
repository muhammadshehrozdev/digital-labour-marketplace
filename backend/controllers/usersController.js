// Settings of the logged-in user, for every role (Batch 3).
import User from '../models/User.js';

// PATCH /api/users/me/preferences  (body checked by preferencesSchema)
export const updateMyPreferences = async (req, res) => {
  const { preferredLanguage } = req.validated.body;
  await User.updateOne({ _id: req.user._id }, { $set: { preferredLanguage } }, { runValidators: true });
  res.json({ preferredLanguage });
};

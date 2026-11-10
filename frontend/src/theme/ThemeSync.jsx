// Keeps the theme and text size of this browser and of the account in step (same rules as the
// language, D-019):
// 1. Chosen during this visit: it wins and is saved on the account.
// 2. Otherwise the account's saved setting is used (it follows the user to a new device).
// 3. The account has none yet: this browser's saved setting is stored on the account.
// After that, every change made while logged in is saved on the account.
import { useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/auth';
import { useTheme } from './context';

export default function ThemeSync() {
  const { user, updateUser } = useAuth();
  const { preference, stored, choseThisVisit, setPreference, textSize, textSizeStored, choseTextSizeThisVisit, setTextSize } = useTheme();
  const syncedFor = useRef(null);

  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    const firstLook = syncedFor.current !== user._id;
    syncedFor.current = user._id;
    const changes = {};
    // [setting on the account, value here, saved in this browser, chosen this visit, apply]
    const settings = [
      ['preferredTheme', preference, stored, choseThisVisit, (value) => setPreference(value, { byUser: false })],
      ['preferredTextSize', textSize, textSizeStored, choseTextSizeThisVisit, (value) => setTextSize(value, { byUser: false })],
    ];
    for (const [key, here, savedHere, chosen, apply] of settings) {
      const onAccount = user[key];
      if (onAccount === here) continue;
      if (chosen) changes[key] = here;
      else if (firstLook && onAccount) apply(onAccount);
      else if (firstLook && savedHere) changes[key] = here;
    }
    if (Object.keys(changes).length > 0) {
      API.patch('/users/me/preferences', changes)
        .then(() => updateUser(changes))
        .catch(() => {}); // stays saved in this browser; the next change or login tries again
    }
  }, [user, updateUser, preference, stored, choseThisVisit, setPreference, textSize, textSizeStored, choseTextSizeThisVisit, setTextSize]);

  return null;
}

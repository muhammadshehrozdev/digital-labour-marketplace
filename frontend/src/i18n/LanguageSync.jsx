// After login (or when the session loads), use the language saved on the user's account.
// If the account has none yet, save the language chosen in this browser.
import { useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/auth';
import { useLanguage } from './context';

export default function LanguageSync() {
  const { user, updateUser } = useAuth();
  const { lang, chosen, setLanguage } = useLanguage();
  const syncedFor = useRef(null);

  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user._id) return;
    syncedFor.current = user._id;
    const saved = user.preferredLanguage;
    if (saved && (saved !== lang || !chosen)) {
      setLanguage(saved).catch(() => {});
    } else if (!saved && chosen) {
      API.patch('/users/me/preferences', { preferredLanguage: lang })
        .then(() => updateUser({ preferredLanguage: lang }))
        .catch(() => {}); // stays saved in this browser; the next login tries again
    }
  }, [user, lang, chosen, setLanguage, updateUser]);

  return null;
}

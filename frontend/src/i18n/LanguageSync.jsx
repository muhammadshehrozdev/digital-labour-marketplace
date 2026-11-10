// After login (or when the session loads), decide the language (D-019):
// 1. The user picked a language during this visit (chooser or switcher): it wins, and is
//    saved to the account (so an old account setting never undoes a fresh choice).
// 2. Otherwise, the language saved on the account is used (it follows the user to a new device).
// 3. The account has none yet: the language of this browser is saved to the account.
import { useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/auth';
import { useLanguage } from './context';

export default function LanguageSync() {
  const { user, updateUser } = useAuth();
  const { lang, chosen, choseThisVisit, setLanguage } = useLanguage();
  const syncedFor = useRef(null);

  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user._id) return;
    syncedFor.current = user._id;
    const saved = user.preferredLanguage;
    if (saved && saved !== lang && choseThisVisit) {
      API.patch('/users/me/preferences', { preferredLanguage: lang })
        .then(() => updateUser({ preferredLanguage: lang }))
        .catch(() => {});
    } else if (saved && (saved !== lang || !chosen)) {
      setLanguage(saved, { byUser: false }).catch(() => {});
    } else if (!saved && chosen) {
      API.patch('/users/me/preferences', { preferredLanguage: lang })
        .then(() => updateUser({ preferredLanguage: lang }))
        .catch(() => {}); // stays saved in this browser; the next login tries again
    }
  }, [user, lang, chosen, choseThisVisit, setLanguage, updateUser]);

  return null;
}

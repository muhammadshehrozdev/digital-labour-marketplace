// Change the website language from a switcher or the chooser. For a logged-in user the choice
// is also saved on the server (PATCH /api/users/me/preferences), so it follows them to another device.
import { useCallback } from 'react';
import API from '../api';
import { useAuth } from '../context/auth';
import { useToast } from '../components/ui/toastContext';
import { useLanguage } from './context';

export function useChangeLanguage() {
  const { setLanguage, t } = useLanguage();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  return useCallback(
    async (code) => {
      try {
        await setLanguage(code);
      } catch {
        toast.show({ tone: 'danger', title: t('language.loadFailed') });
        return;
      }
      if (!user || user.preferredLanguage === code) return;
      try {
        await API.patch('/users/me/preferences', { preferredLanguage: code });
        updateUser({ preferredLanguage: code });
      } catch {
        toast.show({ tone: 'info', title: t('language.savedHereOnly') });
      }
    },
    [setLanguage, user, updateUser, toast, t]
  );
}

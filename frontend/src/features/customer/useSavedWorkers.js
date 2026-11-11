// The logged-in customer's saved workers (Batch 4, feature 23): which workers are saved, and
// save / remove with the change shown at once (and put back if the server says no).
import { useCallback, useEffect, useState } from 'react';
import API from '../../api';
import { useAuth } from '../../context/auth';
import { useToast } from '../../components/ui/toastContext';
import { useT } from '../../i18n';
import { buzz } from '../../utils/haptics';

export function useSavedWorkers() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useT();
  const enabled = user?.role === 'customer';
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    API.get('/saved/ids').then(({ data }) => active && setIds(new Set(data.ids))).catch(() => {});
    return () => {
      active = false;
    };
  }, [enabled]);

  const set = useCallback((id, saved) => setIds((current) => {
    const next = new Set(current);
    if (saved) next.add(id); else next.delete(id);
    return next;
  }), []);

  // Sends one change to the server; the screen already shows it, and is put back if it fails.
  const change = useCallback(async (id, saving) => {
    set(id, saving);
    try {
      if (saving) await API.put(`/saved/${encodeURIComponent(id)}`);
      else await API.delete(`/saved/${encodeURIComponent(id)}`);
      return true;
    } catch {
      set(id, !saving);
      toast.show({ tone: 'danger', title: t('customerx.saveFailed') });
      return false;
    }
  }, [set, toast, t]);

  const toggle = useCallback(async (id) => {
    const saving = !ids.has(id);
    if (saving) buzz(12);
    const ok = await change(id, saving);
    if (ok) {
      toast.show({
        tone: saving ? 'success' : 'info',
        title: t(saving ? 'customerx.savedToast' : 'customerx.removedToast'),
        // removing can be undone for a few seconds
        action: saving ? undefined : { label: t('customerx.undo'), onClick: () => change(id, true) },
      });
    }
    return ok;
  }, [ids, change, toast, t]);

  return { enabled, ids, isSaved: (id) => ids.has(id), toggle };
}

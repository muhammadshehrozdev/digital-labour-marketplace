// Autosave drafts (Batch 4, feature 8): what a person types in a form is kept on this device
// (localStorage) until the form is saved, so closing the tab or a dead battery loses nothing.
//   const draft = useDraft('about', values, setValues, { exclude: ['cnicNumber'] });
//   draft.clear()  after a successful save
// Rules: one draft per account and form; never a field listed in `exclude` (the CNIC is never
// written to storage); a draft that equals the saved values is not kept; a restored draft is
// announced with a toast that offers "Discard draft".
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/auth';
import { useToast } from '../components/ui/toastContext';
import { useT } from '../i18n';

export const DRAFT_DELAY_MS = 600;
const keyFor = (userId, name) => `dlm.draft.${userId}.${name}`;
const without = (values, exclude) => Object.fromEntries(Object.entries(values).filter(([k]) => !exclude.includes(k)));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function readDraft(userId, name) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(keyFor(userId, name)) ?? 'null');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function useDraft(name, values, setValues, { exclude = [], enabled = true } = {}) {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useT();
  const userId = user?._id;
  const baseline = useRef(null); // the values when the form opened (what the server has)
  const restored = useRef(false);
  const cleared = useRef(false);

  // On opening the form: put a saved draft back (once).
  useEffect(() => {
    if (!enabled || !userId || restored.current) return;
    restored.current = true;
    baseline.current = without(values, exclude);
    const draft = readDraft(userId, name);
    if (!draft || same(draft, baseline.current)) return;
    const before = values;
    // only known fields of this form are taken from storage, never an excluded one
    const known = Object.fromEntries(Object.entries(draft).filter(([k]) => k in values && !exclude.includes(k)));
    setValues({ ...values, ...known });
    toast.show({
      tone: 'info',
      title: t('workerx.draft.restored'),
      message: t('workerx.draft.restoredText'),
      action: {
        label: t('workerx.draft.discard'),
        onClick: () => {
          try { window.localStorage.removeItem(keyFor(userId, name)); } catch { /* nothing to remove */ }
          cleared.current = true;
          setValues(before);
        },
      },
    });
    // run once per form opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId, name]);

  // While typing: save a moment after the last change.
  const text = JSON.stringify(without(values, exclude));
  useEffect(() => {
    if (!enabled || !userId || !restored.current) return undefined;
    const timer = window.setTimeout(() => {
      try {
        if (cleared.current) cleared.current = false;
        if (baseline.current && text === JSON.stringify(baseline.current)) window.localStorage.removeItem(keyFor(userId, name));
        else window.localStorage.setItem(keyFor(userId, name), text);
      } catch {
        // storage is full or blocked: the form still works, only without a draft
      }
    }, DRAFT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [text, enabled, userId, name]);

  // After a successful save: the server has it, so the draft goes away and the baseline moves.
  const clear = useCallback((savedValues) => {
    if (savedValues) baseline.current = without(savedValues, exclude);
    try {
      if (userId) window.localStorage.removeItem(keyFor(userId, name));
    } catch {
      // nothing to remove
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, name]);

  return { clear };
}

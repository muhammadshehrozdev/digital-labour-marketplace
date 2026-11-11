// Session ending warning (Batch 4, feature 48). A login lasts 8 hours (D-006). Two minutes before
// it ends a dialog asks the person to save their work; when it has ended they go to "Log in"
// with a message. The end time comes from the server (sessionExpiresAt).
import { useEffect, useState } from 'react';
import { TimerReset } from 'lucide-react';
import { Button, Dialog } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { useT } from '../../i18n';

export const WARN_BEFORE_MS = 2 * 60 * 1000;
const MAX_TIMER_MS = 2 ** 31 - 1; // browsers cannot wait longer than this in one timer

export default function SessionWatch() {
  const { t } = useT();
  const { user, expire } = useAuth();
  const ends = user?.sessionExpiresAt ? new Date(user.sessionExpiresAt).getTime() : null;
  const [warnedFor, setWarnedFor] = useState(null);
  const [dismissedFor, setDismissedFor] = useState(null);

  useEffect(() => {
    if (!ends || Number.isNaN(ends)) return undefined;
    const now = Date.now();
    const warnIn = Math.max(0, ends - WARN_BEFORE_MS - now);
    const endIn = Math.max(0, ends - now);
    const timers = [];
    if (warnIn < MAX_TIMER_MS) timers.push(window.setTimeout(() => setWarnedFor(ends), warnIn));
    if (endIn < MAX_TIMER_MS) timers.push(window.setTimeout(() => expire(), endIn));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [ends, expire]);

  const open = Boolean(ends) && warnedFor === ends && dismissedFor !== ends;
  return (
    <Dialog
      open={open}
      onClose={() => setDismissedFor(ends)}
      title={t('appx.session.title')}
      footer={<Button icon={TimerReset} onClick={() => setDismissedFor(ends)}>{t('appx.session.ok')}</Button>}
    >
      <p>{t('appx.session.text')}</p>
    </Dialog>
  );
}

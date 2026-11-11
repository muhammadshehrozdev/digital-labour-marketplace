// Offline banner (Batch 4, feature 5). Shown when the browser is offline or the server did not
// answer. While the server is unreachable it tries again every 15 seconds by itself; "Try now"
// does it at once. When the connection is back it says so for a moment.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '../../components/ui';
import { useT } from '../../i18n';
import { getConnectivity, retryAll, subscribeConnectivity } from './connectivity';
import styles from './AppFeatures.module.css';

export const AUTO_RETRY_MS = 15000;

export default function OfflineBanner() {
  const { t } = useT();
  const state = useSyncExternalStore(subscribeConnectivity, getConnectivity, getConnectivity);
  const problem = !state.online || state.serverDown;
  const [back, setBack] = useState(false);
  const wasProblem = useRef(problem);

  useEffect(() => {
    let timer;
    if (wasProblem.current && !problem) {
      timer = window.setTimeout(() => setBack(false), 3000);
      window.setTimeout(() => setBack(true), 0);
    }
    wasProblem.current = problem;
    return () => window.clearTimeout(timer);
  }, [problem]);

  useEffect(() => {
    if (!state.serverDown || !state.online) return undefined;
    const timer = window.setInterval(retryAll, AUTO_RETRY_MS);
    return () => window.clearInterval(timer);
  }, [state.serverDown, state.online]);

  if (!problem && !back) return null;
  return (
    <div className={[styles.offline, problem ? styles.offlineBad : styles.offlineGood].join(' ')} role="status" data-testid="offline-banner">
      {problem && <WifiOff size={18} aria-hidden="true" />}
      <span>{problem ? (state.online ? t('appx.offline.failedRequest') : t('appx.offline.banner')) : t('appx.offline.back')}</span>
      {problem && <Button size="sm" variant="secondary" icon={RefreshCw} onClick={retryAll}>{t('appx.offline.retry')}</Button>}
    </div>
  );
}

// The compare tray (feature 24): a bar at the bottom of the screen that lists the chosen workers
// (up to three) and opens the comparison. Shown on every customer page while something is chosen.
import { Scale, X } from 'lucide-react';
import { Button } from '../../components/ui';
import { useT } from '../../i18n';
import { useCompare } from './compareStore';
import styles from './Customer.module.css';

export default function CompareTray() {
  const { t } = useT();
  const { list, remove, clear } = useCompare();
  if (list.length === 0) return null;
  const to = `/compare?ids=${list.map((w) => encodeURIComponent(w.id)).join(',')}`;
  return (
    <aside className={styles.tray} aria-label={t('customerx.compare.tray')} data-testid="compare-tray">
      <div className={styles.trayInner}>
        <Scale size={20} strokeWidth={1.75} aria-hidden="true" className={styles.trayIcon} />
        <ul className={styles.trayList}>
          {list.map((w) => (
            <li key={w.id}>
              <span dir="auto">{w.name}</span>
              <button type="button" className={styles.trayRemove} aria-label={t('customerx.compare.remove', { name: w.name })} onClick={() => remove(w.id)}><X size={14} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
        <p className={styles.trayHint} role="status">{t('customerx.compare.trayHint', { count: list.length })}</p>
        <div className={styles.trayActions}>
          <Button size="sm" variant="ghost" onClick={clear}>{t('customerx.compare.clear')}</Button>
          {/* a link when there is something to compare; a disabled button until then */}
          {list.length >= 2
            ? <Button size="sm" to={to} icon={Scale}>{t('customerx.compare.open')}</Button>
            : <Button size="sm" disabled icon={Scale}>{t('customerx.compare.open')}</Button>}
        </div>
      </div>
    </aside>
  );
}

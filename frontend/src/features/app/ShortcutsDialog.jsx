// The list of keyboard shortcuts (Batch 4, feature 36), opened with "?" on any page.
import { Dialog } from '../../components/ui';
import { useT } from '../../i18n';
import styles from './AppFeatures.module.css';

const GLOBAL_SHORTCUTS = [
  { keys: ['Ctrl', 'K'], label: 'palette' },
  { keys: ['?'], label: 'help' },
  { keys: ['/'], label: 'search' },
  { keys: ['g', 'h'], label: 'home', then: true },
  { keys: ['t'], label: 'theme' },
];

export default function ShortcutsDialog({ open, onClose }) {
  const { t } = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t('appx.shortcuts.title')} description={t('appx.shortcuts.note')}>
      <dl className={styles.keys} dir="ltr">
        {GLOBAL_SHORTCUTS.map((s) => (
          <div key={s.label}>
            <dt>
              {s.keys.map((k, i) => (
                <span key={k}>{i > 0 && <span className={styles.then}>{s.then ? ` ${t('appx.shortcuts.then')} ` : ' + '}</span>}<kbd>{k}</kbd></span>
              ))}
            </dt>
            <dd dir="auto">{t(`appx.shortcuts.${s.label}`)}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}

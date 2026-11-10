// The list of review shortcuts, opened with "?" or its button.
import { Keyboard } from 'lucide-react';
import { Button, Dialog } from '../../components/ui';
import { useT } from '../../i18n';
import { REVIEW_KEYS } from './useReviewShortcuts';
import styles from './AdminFeatures.module.css';

export function ShortcutsButton({ onClick }) {
  const { t } = useT();
  return <Button size="sm" variant="ghost" icon={Keyboard} onClick={onClick} aria-keyshortcuts="?">{t('adminx.shortcuts.open')}</Button>;
}

export default function ShortcutsHelp({ open, onClose, available = ['approve', 'reject', 'next', 'previous', 'help'] }) {
  const { t } = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t('adminx.shortcuts.title')} description={t('adminx.shortcuts.note')}>
      <dl className={styles.keys}>
        {REVIEW_KEYS.filter((k) => available.includes(k.action)).map((k) => (
          <div key={k.key}><dt><kbd>{k.key}</kbd></dt><dd>{t(`adminx.shortcuts.${k.action}`)}</dd></div>
        ))}
        <div><dt><kbd>Esc</kbd></dt><dd>{t('adminx.shortcuts.close')}</dd></div>
      </dl>
    </Dialog>
  );
}

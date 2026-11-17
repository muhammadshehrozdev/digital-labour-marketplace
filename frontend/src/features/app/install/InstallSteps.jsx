// The steps dialog (BATCH_6B 4.3): when the browser has no saved install question, it shows how to install
// on THIS platform, step by step, each with a picture of the button to press and its own 🔊.
//   chromium (no saved event)  the browser menu: ⋮ -> "Install app" / "Add to Home screen" -> "Install"
//   ios-safari                 Share -> "Add to Home Screen" -> "Add"
//   ios-other                  "Open this page in Safari" + copy the link
//   other (e.g. Firefox)       "Install works in Chrome or Edge" + the link
import { Check, Copy, Download, EllipsisVertical, Plus, Share, SquarePlus } from 'lucide-react';
import { Button, Dialog, useToast } from '../../../components/ui';
import { useT } from '../../../i18n';
import OptionListen from '../../assist/OptionListen';
import styles from './Install.module.css';

const STEPS = {
  chromium: [['step1', EllipsisVertical], ['step2', Download], ['step3', Check]],
  'ios-safari': [['step1', Share], ['step2', SquarePlus], ['step3', Plus]],
};
const GROUP = { chromium: 'chromium', 'ios-safari': 'iosSafari', 'ios-other': 'iosOther', other: 'other' };

function CopyLink() {
  const { t } = useT();
  const toast = useToast();
  const url = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.show({ title: t('b6b.install.copied') });
    } catch {
      toast.show({ tone: 'danger', title: t('b6b.install.copyFailed') });
    }
  };
  return (
    <div className={styles.link}>
      <label className={styles.linkLabel}>
        <span>{t('b6b.install.linkLabel')}</span>
        <input type="text" readOnly value={url} dir="ltr" onFocus={(e) => e.target.select()} />
      </label>
      <Button variant="secondary" icon={Copy} onClick={copy}>{t('b6b.install.copy')}</Button>
    </div>
  );
}

export default function InstallSteps({ open, onClose, platform }) {
  const { t } = useT();
  const group = GROUP[platform] ?? 'other';
  const steps = STEPS[platform];
  return (
    <Dialog open={open} onClose={onClose} title={t('b6b.install.stepsTitle')} size="sm">
      <div className={styles.steps} data-testid={`install-steps-${platform}`}>
        <p className={styles.intro}>
          {t(`b6b.install.${group}.intro`)}
          <OptionListen helpKey={`help.option.install.${group}.intro`} name={t('b6b.install.stepsTitle')} />
        </p>
        {steps && (
          <ol className={styles.stepList}>
            {steps.map(([id, Icon], i) => (
              <li key={id} className={styles.step}>
                <span className={styles.picture} aria-hidden="true"><Icon size={30} strokeWidth={1.75} /><span className={styles.number}>{i + 1}</span></span>
                <span className={styles.stepText}>{t(`b6b.install.${group}.${id}`)}</span>
                <OptionListen helpKey={`help.option.install.${group}.${id}`} name={t('b6b.install.stepName', { n: i + 1 })} />
              </li>
            ))}
          </ol>
        )}
        {!steps && <CopyLink />}
        <Button onClick={onClose}>{t('b6b.install.done')}</Button>
      </div>
    </Dialog>
  );
}

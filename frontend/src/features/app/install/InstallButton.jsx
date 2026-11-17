// "Install this app" at the bottom of EVERY page (in the shared footer), for every role and for visitors
// (BATCH_6B 4.4). It behaves exactly like Install in the invitation; hidden only when the app is installed.
import { Smartphone } from 'lucide-react';
import { useT } from '../../../i18n';
import OptionListen from '../../assist/OptionListen';
import InstallSteps from './InstallSteps';
import { useInstallAction } from './useInstallAction';
import styles from './Install.module.css';

export default function InstallButton() {
  const { t } = useT();
  const { install, stepsOpen, closeSteps, platform, isInstalled } = useInstallAction();
  if (isInstalled) return null;
  return (
    <div className={styles.footerRow} data-testid="install-footer">
      <button type="button" className={styles.footerButton} onClick={install}>
        <Smartphone size={20} strokeWidth={1.75} aria-hidden="true" /> {t('b6b.install.footerButton')}
      </button>
      <OptionListen helpKey="help.option.install.line" name={t('b6b.install.footerButton')} />
      <InstallSteps open={stepsOpen} onClose={closeSteps} platform={platform} />
    </div>
  );
}

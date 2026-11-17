// What "Install" does, the same in the first-visit invitation and the footer button (BATCH_6B 4.3):
//   chromium with a saved event  the browser's own question; "accepted" -> a thank-you toast;
//                                "dismissed" -> like "Not now" (14 days)
//   everything else              the steps dialog for this platform (InstallSteps)
import { useState } from 'react';
import { useToast } from '../../../components/ui';
import { useT } from '../../../i18n';
import { hideForDays, useInstall } from './installStore';

export function useInstallAction({ onDone } = {}) {
  const { platform, canPrompt, isInstalled, promptInstall } = useInstall();
  const toast = useToast();
  const { t } = useT();
  const [stepsOpen, setStepsOpen] = useState(false);

  const install = async () => {
    if (platform === 'chromium' && canPrompt) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') toast.show({ title: t('b6b.install.thanks') });
      else hideForDays();
      onDone?.(outcome);
      return outcome;
    }
    setStepsOpen(true);
    return 'steps';
  };
  const closeSteps = () => {
    setStepsOpen(false);
    onDone?.('steps');
  };
  return { install, stepsOpen, closeSteps, platform, isInstalled };
}

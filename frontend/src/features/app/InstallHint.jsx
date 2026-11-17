// The first-visit invitation to install the app (Batch 4 feature 6, rebuilt in Batch 6B on the shared install
// service in ./install). An in-page bottom sheet, not a phone notification: the app icon, one short line, a
// 🔊 Listen button, Install and Not now.
// When: once per device per 14 days, after the person shows interest: on the second page opened in this visit
// or after 30 seconds on the site, whichever comes first. Never on the language chooser (this component is not
// shown there), over an open dialog, while a text field has focus, before the first touch (the speech rule of
// Batch 5), while the mobile menu is open or another bar sits at the bottom (compare tray, onboarding buttons).
// Who: everyone, visitors too. Never when the app is already installed.
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo } from '../../components/brand/LogoMarkOnly';
import { Button, IconButton } from '../../components/ui';
import { useT } from '../../i18n';
import { hiddenUntil, hideForDays } from './install/installStore';
import { useInstallAction } from './install/useInstallAction';
import InstallSteps from './install/InstallSteps';
import ListenLine from './install/ListenLine';
import { INVITE_AFTER_MS, INVITE_CHECK_MS, inviteBlocked } from './install/invite';
import styles from './install/Install.module.css';

// Interest: the second page of this visit, or 30 seconds on the site.
function useInterest() {
  const { pathname } = useLocation();
  const pages = useRef(new Set());
  const [interested, setInterested] = useState(false);
  useEffect(() => {
    pages.current.add(pathname);
    if (pages.current.size >= 2) setInterested(true);
  }, [pathname]);
  useEffect(() => {
    const timer = window.setTimeout(() => setInterested(true), INVITE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return interested;
}

export default function InstallHint() {
  const { t } = useT();
  const interested = useInterest();
  const [open, setOpen] = useState(false);
  const [answered, setAnswered] = useState(false);
  const close = () => {
    setOpen(false);
    setAnswered(true);
  };
  const { install, stepsOpen, closeSteps, platform, isInstalled } = useInstallAction({
    onDone: (outcome) => close(outcome),
  });
  const notNow = () => {
    hideForDays();
    close();
  };

  // wait until nothing stands in the way, then show it (and count it as shown for 14 days)
  const waiting = interested && !open && !answered && !isInstalled;
  useEffect(() => {
    if (!waiting || hiddenUntil() > Date.now()) return undefined;
    const tryShow = () => {
      if (inviteBlocked()) return false;
      hideForDays();
      setOpen(true);
      return true;
    };
    if (tryShow()) return undefined;
    const timer = window.setInterval(() => tryShow() && window.clearInterval(timer), INVITE_CHECK_MS);
    return () => window.clearInterval(timer);
  }, [waiting]);

  useEffect(() => {
    if (!open || stepsOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') notNow();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (isInstalled) return null;
  return (
    <>
      {open && !stepsOpen && (
        <aside className={styles.sheet} data-bottom-bar data-install-sheet aria-labelledby="install-title" data-testid="install-hint">
          <Logo size={44} />
          <div className={styles.sheetText}>
            <h2 id="install-title" className={styles.sheetTitle}>{t('b6b.install.title')}</h2>
            <p className={styles.line}>{t('b6b.install.line')}</p>
            <div className={styles.sheetActions}>
              <ListenLine helpKey="help.option.install.line" name={t('b6b.install.title')} />
              <Button size="sm" onClick={install}>{t('b6b.install.install')}</Button>
              <Button size="sm" variant="ghost" onClick={notNow}>{t('b6b.install.notNow')}</Button>
            </div>
          </div>
          <IconButton size="sm" label={t('b6b.install.notNow')} icon={X} onClick={notNow} />
        </aside>
      )}
      <InstallSteps open={stepsOpen} onClose={closeSteps} platform={platform} />
    </>
  );
}

// "Install the app" hint (Batch 4, feature 6). Chrome on Android (and desktop Chrome) fires
// beforeinstallprompt when the site can be installed; we keep the event and show a small card.
// "Not now" hides it for 30 days on this device. Other browsers never show it.
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Logo } from '../../components/brand/LogoMarkOnly';
import { Button, IconButton } from '../../components/ui';
import { useT } from '../../i18n';
import styles from './AppFeatures.module.css';

const KEY = 'dlm.installHint';
const HIDE_DAYS = 30;

function hiddenNow() {
  try {
    const until = Number(window.localStorage.getItem(KEY) ?? 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

export default function InstallHint() {
  const { t } = useT();
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault(); // we show our own hint instead of the browser's mini bar
      if (!hiddenNow()) setPrompt(event);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!prompt) return null;
  const later = () => {
    try {
      window.localStorage.setItem(KEY, String(Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000));
    } catch {
      // not remembered
    }
    setPrompt(null);
  };
  const install = async () => {
    prompt.prompt();
    await prompt.userChoice?.catch(() => null);
    setPrompt(null);
  };
  return (
    <aside className={styles.install} data-bottom-bar aria-labelledby="install-title" data-testid="install-hint">
      <Logo size={40} />
      <div className={styles.installText}>
        <h2 id="install-title" className={styles.installTitle}>{t('appx.install.title')}</h2>
        <p>{t('appx.install.text')}</p>
        <div className={styles.installActions}>
          <Button size="sm" icon={Download} onClick={install}>{t('appx.install.button')}</Button>
          <Button size="sm" variant="ghost" onClick={later}>{t('appx.install.later')}</Button>
        </div>
      </div>
      <IconButton size="sm" label={t('appx.install.later')} icon={X} onClick={later} />
    </aside>
  );
}

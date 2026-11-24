// The round 🔊 page help button (Batch 5, D-033): always in the same corner (bottom, start side),
// it says what this page is for and what to do first (help.screen.<name>), and shows the same text in
// a card. It pulses gently on a person's first visit to a page (not with "reduce motion"). It floats
// above any bar at the bottom edge (onboarding buttons on phones, the compare tray, the install hint):
// those carry data-bottom-bar. With auto-read on, it speaks on arrival (only after a first touch).
import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RotateCcw, Volume2, X } from 'lucide-react';
import { useT } from '../../i18n';
import { announce } from './announce';
import { stopSound } from './audio';
import { hasInteracted } from './interaction';
import { pageHelpName } from './pageHelp';
import { getSettings, setSettings, useAssistSettings } from './settingsStore';
import { useAudioState } from './useAudioState';
import { useSay } from './useSay';
import { useBottomLift } from '../app/useBottomLift';
import styles from './PageHelp.module.css';

export default function PageHelp() {
  const { pathname, search } = useLocation();
  const name = pageHelpName(pathname, search);
  if (!name) return null;
  return <PageHelpButton key={name} name={name} />;
}

function PageHelpButton({ name }) {
  const { t } = useT();
  const { say } = useSay();
  const [settings] = useAssistSettings();
  const { playingId } = useAudioState();
  const id = `page-help${useId().replace(/:/g, '')}`;
  const key = `help.screen.${name}`;
  const [open, setOpen] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const lift = useBottomLift();
  const [firstVisit] = useState(() => !getSettings().seenPages.includes(name));
  const playing = playingId === id;

  const speak = async () => {
    const how = await say(id, key);
    setNoVoice(how === 'none');
  };

  // remember the visit (the button stops pulsing next time)
  useEffect(() => () => {
    const seen = getSettings().seenPages;
    if (!seen.includes(name)) setSettings({ seenPages: [...seen, name] });
  }, [name]);

  // auto-read: speak the page help on arrival, but never before the first touch of the page
  useEffect(() => {
    if (!getSettings().autoRead || !hasInteracted()) return undefined;
    const timer = window.setTimeout(async () => {
      setOpen(true);
      const how = await say(id, key);
      setNoVoice(how === 'none');
    }, 400);
    return () => window.clearTimeout(timer);
  }, [id, key, say]);

  if (!settings.showButtons && !open) return null;

  const onClick = () => {
    if (playing) {
      stopSound();
      announce(t('assist.stopped'));
      return;
    }
    setOpen(true);
    announce(t('assist.playing'));
    speak();
  };
  const close = () => {
    stopSound();
    setOpen(false);
    setNoVoice(false);
  };

  return (
    <div className={styles.wrap} style={{ '--lift': `${lift}px` }} data-page-help={name}>
      {open && (
        <div className={styles.card} role="group" aria-label={t('assist.pageHelp')}>
          <p className={styles.text} dir="auto">{t(key)}</p>
          {noVoice && <p className={styles.note}>{t('assist.noVoice')}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.small} onClick={speak}>
              <RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" />
              {t('assist.again')}
            </button>
          </div>
          <button type="button" className={styles.close} aria-label={t('assist.closeHelp')} onClick={close}>
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      )}
      <button
        type="button"
        className={[styles.button, firstVisit && !open && styles.pulse].filter(Boolean).join(' ')}
        aria-pressed={playing}
        aria-label={t('assist.pageHelp')}
        onClick={onClick}
      >
        <Volume2 size={26} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

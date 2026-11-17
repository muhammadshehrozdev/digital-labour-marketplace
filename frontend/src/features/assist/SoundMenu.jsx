// The Sound menu in the header (Batch 5, D-033): two switches, saved on this device only
// (settingsStore): show the Listen / Speak buttons (on by default) and auto-read (off by default),
// plus a link to the voice check page. A disclosure: Escape or a click outside closes it.
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Stethoscope, Volume2 } from 'lucide-react';
import { Switch } from '../../components/ui';
import { useT } from '../../i18n';
import { stopAll } from './audio';
import { useAssistSettings } from './settingsStore';
import { useStayInView } from '../../components/layout/useStayInView';
import styles from './SoundMenu.module.css';

// The settings themselves (the panel below, and the account / More / mobile menu when the header has no
// room for the Sound button: Batch 6B).
export function SoundSettings({ onNavigate }) {
  const { t } = useT();
  const [settings, setSettings] = useAssistSettings();
  return (
    <>
      <Switch label={t('assist.showButtons')} hint={t('assist.showButtonsHint')} checked={settings.showButtons} onChange={(on) => setSettings({ showButtons: on })} />
      <Switch
        label={t('assist.autoRead')}
        hint={t('assist.autoReadHint')}
        checked={settings.autoRead}
        onChange={(on) => {
          if (!on) stopAll();
          setSettings({ autoRead: on, autoReadOffered: true, offerPending: false });
        }}
      />
      <p className={styles.note}>{t('assist.deviceOnly')}</p>
      <Link to="/voice-check" className={styles.link} onClick={onNavigate}>
        <Stethoscope size={18} strokeWidth={1.75} aria-hidden="true" /> {t('assist.voiceCheckLink')}
      </Link>
    </>
  );
}

export default function SoundMenu() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelRef = useRef(null);
  const panelId = `sound${useId().replace(/:/g, '')}`;
  useStayInView(panelRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.button} aria-expanded={open} aria-controls={panelId} aria-label={t('assist.soundMenu')} onClick={() => setOpen((o) => !o)}>
        <Volume2 size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.word} aria-hidden="true">{t('assist.sound')}</span>
        <ChevronDown size={14} aria-hidden="true" className={styles.chevron} />
      </button>
      {open && (
        <div id={panelId} ref={panelRef} className={styles.panel}>
          <p className={styles.title}>{t('assist.soundTitle')}</p>
          <SoundSettings onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

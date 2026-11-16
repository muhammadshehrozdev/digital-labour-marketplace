// Asked once, right after the language is chosen (Batch 5, D-033): should pages and boxes be read
// aloud by themselves? Two big picture buttons and the question's own 🔊. Closing counts as "no".
// The answer can be changed at any time in the Sound menu. Saved on this device only.
import { Volume2, VolumeX } from 'lucide-react';
import { Dialog } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { stopSound } from './audio';
import { setSettings, useAssistSettings } from './settingsStore';
import { useAudioState } from './useAudioState';
import { useSay } from './useSay';
import styles from './AutoReadOffer.module.css';

const ID = 'auto-read-offer';

export default function AutoReadOffer() {
  const { t, chosen } = useLanguage();
  const [settings] = useAssistSettings();
  const { say } = useSay();
  const { playingId } = useAudioState();
  const open = chosen && settings.offerPending && !settings.autoReadOffered;
  if (!open) return null;
  const answer = (autoRead) => {
    stopSound();
    setSettings({ autoRead, autoReadOffered: true, offerPending: false });
  };
  const playing = playingId === ID;
  return (
    <Dialog open onClose={() => answer(false)} title={t('assist.offerTitle')} size="sm">
      <p className={styles.text}>{t('assist.offerText')}</p>
      <button type="button" className={styles.listen} aria-pressed={playing} onClick={() => (playing ? stopSound() : say(ID, 'assist.offerText'))}>
        <Volume2 size={20} strokeWidth={1.75} aria-hidden="true" /> {t('assist.listen')}
      </button>
      <div className={styles.choices}>
        <button type="button" className={styles.choice} onClick={() => answer(true)}>
          <span className={styles.picture} aria-hidden="true"><Volume2 size={40} strokeWidth={1.5} /></span>
          {t('assist.offerYes')}
        </button>
        <button type="button" className={styles.choice} onClick={() => answer(false)}>
          <span className={styles.picture} aria-hidden="true"><VolumeX size={40} strokeWidth={1.5} /></span>
          {t('assist.offerNo')}
        </button>
      </div>
    </Dialog>
  );
}

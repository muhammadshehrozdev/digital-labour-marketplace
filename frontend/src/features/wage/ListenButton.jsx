// 🔊 for a whole Module 5 card (price information, a price proposal, a payment line, a protection tip):
// reads a sentence built in the SPOKEN language (Roman Urdu users hear Urdu), with amounts as plain numbers
// so the voice says them in words ("two thousand five hundred rupees"). build(spokenT, lang) -> text.
import { useId, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useT } from '../../i18n';
import { stopSound } from '../assist/audio';
import { useAudioState } from '../assist/useAudioState';
import { useSay } from '../assist/useSay';
import styles from './Wage.module.css';

export default function ListenButton({ build, label, small = false }) {
  const { t } = useT();
  const { say } = useSay();
  const { playingId } = useAudioState();
  const id = `wage${useId().replace(/:/g, '')}`;
  const [noVoice, setNoVoice] = useState(false);
  const playing = playingId === id;
  const onClick = async () => {
    if (playing) {
      stopSound();
      return;
    }
    const how = await say(id, 'help.wage.say', { say: (lang, spokenT) => build(spokenT, lang) });
    setNoVoice(how === 'none');
  };
  return (
    <span className={styles.listen}>
      <button type="button" className={[styles.listenButton, small && styles.small].filter(Boolean).join(' ')} aria-pressed={playing} data-help-key="help.wage.say" onClick={onClick}>
        <Volume2 size={small ? 18 : 20} aria-hidden="true" /> {label ?? t('wage.listen')}
      </button>
      {noVoice && <span className={styles.muted}>{t('assist.noVoiceOption')}</span>}
    </span>
  );
}

// A 🔊 Listen button with its word (like the "read aloud?" question): plays the help text of `helpKey`.
import { Volume2 } from 'lucide-react';
import { useId } from 'react';
import { useT } from '../../../i18n';
import { stopSound } from '../../assist/audio';
import { useAudioState } from '../../assist/useAudioState';
import { useSay } from '../../assist/useSay';
import styles from './Install.module.css';

export default function ListenLine({ helpKey, name }) {
  const { t } = useT();
  const { say } = useSay();
  const { playingId } = useAudioState();
  const id = `install${useId().replace(/:/g, '')}`;
  const playing = playingId === id;
  return (
    <button type="button" className={styles.listen} aria-pressed={playing} aria-label={t('assist.listenTo', { name })} data-help-key={helpKey} onClick={() => (playing ? stopSound() : say(id, helpKey))}>
      <Volume2 size={18} strokeWidth={1.75} aria-hidden="true" /> {t('assist.listen')}
    </button>
  );
}

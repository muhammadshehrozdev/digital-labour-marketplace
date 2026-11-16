// The small 🔊 on a picture card (Batch 5, D-033): says the option's name and one short line about it
// (help.option.<group>.<value>), because a picture alone can be misread. A real button next to the
// card's radio input (a button may not sit inside a label).
import { useId } from 'react';
import { Volume2 } from 'lucide-react';
import { useT } from '../../i18n';
import { stopSound } from './audio';
import { useAssistSettings } from './settingsStore';
import { useAudioState } from './useAudioState';
import { useSay } from './useSay';
import styles from './Assist.module.css';

export default function OptionListen({ helpKey, params, name, onNoVoice, className }) {
  const { t } = useT();
  const { say } = useSay();
  const [settings] = useAssistSettings();
  const { playingId } = useAudioState();
  const id = `option${useId().replace(/:/g, '')}`;
  if (!settings.showButtons) return null;
  const playing = playingId === id;
  const onClick = async () => {
    if (playing) {
      stopSound();
      return;
    }
    const how = await say(id, helpKey, params);
    if (how === 'none') onNoVoice?.();
  };
  return (
    <button
      type="button"
      className={[styles.optionListen, className].filter(Boolean).join(' ')}
      aria-pressed={playing}
      aria-label={t('assist.listenTo', { name })}
      data-state={playing ? 'playing' : undefined}
      data-help-key={helpKey}
      onClick={onClick}
    >
      <Volume2 size={18} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

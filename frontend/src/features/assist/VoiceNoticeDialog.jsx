// Shown the first time a person uses 🎤 on this device (Batch 5, D-035): voice typing is the
// browser's own feature and may send the audio to the browser maker's online service. Accepting is
// remembered on this device only (settingsStore). The notice can be heard, and stays in the Help Centre.
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { Button, Dialog } from '../../components/ui';
import { useT } from '../../i18n';
import { stopSound } from './audio';
import { useAudioState } from './useAudioState';
import { useSay } from './useSay';

const ID = 'voice-notice';

export default function VoiceNoticeDialog({ open, onAccept, onClose }) {
  const { t } = useT();
  const { say } = useSay();
  const { playingId } = useAudioState();
  const playing = playingId === ID;
  const close = () => { stopSound(); onClose(); };
  return (
    <Dialog
      open={open}
      onClose={close}
      title={t('assist.noticeTitle')}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={close}>{t('common.cancel')}</Button>
          <Button icon={Mic} onClick={() => { stopSound(); onAccept(); }}>{t('assist.noticeAccept')}</Button>
        </>
      )}
    >
      <p>{t('voice.notice')}</p>
      <p>{t('assist.noticeMore')}</p>
      <Button
        variant="ghost"
        icon={playing ? VolumeX : Volume2}
        aria-pressed={playing}
        onClick={() => (playing ? stopSound() : say(ID, 'voice.notice'))}
      >
        {playing ? t('assist.stopSound') : t('assist.listen')}
      </Button>
    </Dialog>
  );
}

// Voice check (Batch 5, D-036): what sound and voice features work on THIS device, in plain words.
// It lists the device's voices, plays a test sentence in English and in Urdu, counts the team's
// recorded clips, tests voice typing (after the same one-time notice), and explains how to add an Urdu
// voice on an Android phone. Nothing is sent anywhere by this page itself.
import { useEffect, useState } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { Alert, Button, PageHeader } from '../../components/ui';
import { useDocumentTitle, useLanguage } from '../../i18n';
import { languageInfo } from '../../i18n/languages';
import { loadVoices, play, stopSound } from '../../features/assist/audio';
import manifest from '../../features/assist/clipManifest.json';
import { setSettings, useAssistSettings } from '../../features/assist/settingsStore';
import { useAudioState } from '../../features/assist/useAudioState';
import { getRecognition, useVoiceTyping } from '../../features/assist/useVoiceTyping';
import { pickVoice } from '../../features/assist/voices';
import VoiceNoticeDialog from '../../features/assist/VoiceNoticeDialog';
import styles from './VoiceCheck.module.css';

const TESTS = {
  en: 'This is a test of the English voice. If you can hear this, English audio help works.',
  ur: 'یہ اردو آواز کا امتحان ہے۔ اگر آپ یہ سن رہے ہیں تو اردو میں آواز والی مدد چلے گی۔',
};

export default function VoiceCheck() {
  const { t, lang } = useLanguage();
  useDocumentTitle(t('help.voiceCheck.title'));
  const [settings] = useAssistSettings();
  const { playingId } = useAudioState();
  const [voices, setVoices] = useState(null);
  const [result, setResult] = useState({});
  const [heard, setHeard] = useState('');
  const [noticeOpen, setNoticeOpen] = useState(false);
  const speechLang = languageInfo(lang).speech;
  const voice = useVoiceTyping({ speechLang, onText: setHeard });

  useEffect(() => {
    let alive = true;
    loadVoices(2000).then((list) => { if (alive) setVoices(list); });
    return () => { alive = false; };
  }, []);

  const test = async (l) => {
    const id = `voice-check-${l}`;
    if (playingId === id) return stopSound();
    const how = await play({ id, text: TESTS[l], lang: l });
    return setResult((r) => ({ ...r, [l]: how }));
  };

  const micTest = () => {
    if (voice.listening) return voice.stop();
    if (!settings.noticeAccepted) return setNoticeOpen(true);
    setHeard('');
    return voice.start();
  };

  const has = (l) => Boolean(pickVoice(voices ?? [], l));
  const clips = { ur: manifest.ur?.length ?? 0, en: manifest.en?.length ?? 0 };
  const audioState = (l) => (clips[l] ? 'clips' : has(l) ? 'voice' : 'text');
  const micState = !getRecognition() ? 'none' : typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'ok';

  return (
    <div className={styles.page}>
      <PageHeader title={t('help.voiceCheck.title')} description={t('help.voiceCheck.lead')} />

      <section className={styles.card} aria-labelledby="vc-summary">
        <h2 id="vc-summary" className={styles.h2}>{t('help.voiceCheck.summaryTitle')}</h2>
        {voices === null ? <p>{t('help.voiceCheck.loading')}</p> : (
          <ul className={styles.summary}>
            <li data-state={audioState('ur')}>{t(`help.voiceCheck.audio.${audioState('ur')}`, { language: t('help.voiceCheck.urdu') })}</li>
            <li data-state={audioState('en')}>{t(`help.voiceCheck.audio.${audioState('en')}`, { language: t('help.voiceCheck.english') })}</li>
            <li data-state={micState}>{t(`help.voiceCheck.mic.${micState}`)}</li>
          </ul>
        )}
      </section>

      <section className={styles.card} aria-labelledby="vc-voices">
        <h2 id="vc-voices" className={styles.h2}>{t('help.voiceCheck.voicesTitle')}</h2>
        {voices && voices.length === 0 && <p>{t('help.voiceCheck.noVoices')}</p>}
        {voices && voices.length > 0 && (
          <ul className={styles.voices}>
            {voices.map((v) => <li key={`${v.name}-${v.lang}`}><span dir="auto">{v.name}</span> <span className={styles.code} dir="ltr">{v.lang}</span></li>)}
          </ul>
        )}
        <p>{t('help.voiceCheck.clips', { ur: clips.ur, en: clips.en })}</p>
        <div className={styles.buttons}>
          {['en', 'ur'].map((l) => (
            <Button key={l} variant="secondary" icon={Volume2} aria-pressed={playingId === `voice-check-${l}`} onClick={() => test(l)}>
              {t(`help.voiceCheck.test.${l}`)}
            </Button>
          ))}
        </div>
        {['en', 'ur'].filter((l) => result[l] === 'none').map((l) => (
          <Alert key={l} tone="info">{t('help.voiceCheck.testFailed', { language: t(l === 'ur' ? 'help.voiceCheck.urdu' : 'help.voiceCheck.english') })}</Alert>
        ))}
      </section>

      <section className={styles.card} aria-labelledby="vc-mic">
        <h2 id="vc-mic" className={styles.h2}>{t('help.voiceCheck.micTitle')}</h2>
        <p>{t('voice.notice')}</p>
        {micState === 'none' ? <Alert tone="info">{t('assist.noMic')}</Alert> : (
          <>
            <Button icon={Mic} aria-pressed={voice.listening} onClick={micTest}>{voice.listening ? t('voice.stop') : t('help.voiceCheck.micButton')}</Button>
            {voice.listening && <p role="status">{t('voice.listening')}</p>}
            {heard && <p className={styles.heard} role="status">{t('help.voiceCheck.heard')} <strong dir="auto">{heard}</strong></p>}
            {voice.error && <Alert tone="warning">{t(voice.error.key, { language: t(`voice.speechLanguages.${speechLang}`) })}</Alert>}
          </>
        )}
      </section>

      <section className={styles.card} aria-labelledby="vc-add">
        <h2 id="vc-add" className={styles.h2}>{t('help.voiceCheck.addTitle')}</h2>
        <ol className={styles.steps}>
          {t('help.voiceCheck.addSteps').split('|').map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className={styles.note}>{t('help.voiceCheck.addNote')}</p>
      </section>

      {noticeOpen && (
        <VoiceNoticeDialog
          open
          onClose={() => setNoticeOpen(false)}
          onAccept={() => {
            setSettings({ noticeAccepted: true });
            setNoticeOpen(false);
            setHeard('');
            voice.start();
          }}
        />
      )}
    </div>
  );
}

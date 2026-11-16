// The assist row under a form field (Batch 5, "Listen, Speak, See", D-033):
//   🔊 Listen  plays the help for this field (recorded clip, else a device voice) and opens a bubble
//              with the same help in large text: always both, for noisy places and hearing-impaired users.
//   🎤 Speak   voice typing with the browser's own speech feature. Single-line fields: what was said
//              REPLACES the value (one-tap Undo); multi-line fields: it is ADDED at the end. Numbers go
//              through spokenToDigits (nothing is written if anything was not understood). Afterwards
//              the answer is read back, so a person who cannot read can check it.
// Text input stays the main way: the row only helps. Never Speak and never read-back for passwords,
// CNIC and email (assistRules.js). The row is hidden when the person switched the buttons off.
import { memo, useEffect, useId, useRef, useState } from 'react';
import { Mic, RotateCcw, Undo2, Volume2, X } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { languageInfo } from '../../i18n/languages';
import { spokenToDigits } from '../../utils/spokenNumbers';
import { announce } from './announce';
import { getAudioState, stopMic, stopSound } from './audio';
import { hasInteracted } from './interaction';
import { isPrivateField, speakModeFor } from './assistRules';
import { useAssistSettings } from './settingsStore';
import { useAudioState } from './useAudioState';
import { useSay } from './useSay';
import { useVoiceTyping } from './useVoiceTyping';
import VoiceNoticeDialog from './VoiceNoticeDialog';
import styles from './Assist.module.css';

function FieldAssist({ helpKey, label, icon: Icon, speak, value = '', onValue, multiline = false, inputType, mask, secret = false, controlId }) {
  const { t, lang } = useLanguage();
  const [settings, setSettings] = useAssistSettings();
  const { say, readBack } = useSay();
  const { playingId } = useAudioState();
  const base = `assist${useId().replace(/:/g, '')}`;
  const helpId = `${base}-help`;
  const answerId = `${base}-answer`;
  const [bubble, setBubble] = useState(false);
  const [message, setMessage] = useState(null); // { key, params }: a problem to explain instead of the help
  const [noVoiceFor, setNoVoiceFor] = useState(null); // 'help' | 'answer'
  const [undo, setUndo] = useState(null); // { value } after voice replaced a single-line value
  const [noticeOpen, setNoticeOpen] = useState(false);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  const textKey = `help.field.${helpKey}`;
  const mode = speakModeFor({ speak, inputType, mask, secret });
  const readMode = mode === 'digits' ? 'digits' : mode === 'number' ? 'number' : 'text';
  const canReadBack = !isPrivateField({ inputType, mask, secret });
  const speechLang = languageInfo(lang).speech;
  const fieldName = typeof label === 'string' ? label : '';

  const speakKey = async (key, params) => {
    const how = await say(helpId, key, params);
    setNoVoiceFor(how === 'none' ? 'help' : null);
  };

  const explain = (key, params) => {
    setMessage({ key, params });
    setBubble(true);
    speakKey(key, params);
  };

  const sayAnswer = async (text) => {
    const how = await readBack(answerId, text, readMode);
    if (how === 'none') {
      setNoVoiceFor('answer');
      setBubble(true);
    }
  };

  const onSpoken = (said) => {
    let next;
    if (mode === 'digits' || mode === 'number') {
      next = spokenToDigits(said, mode);
      if (!next) {
        explain('assist.notUnderstood'); // a wrong number is worse than an empty box
        return;
      }
    } else if (multiline) {
      const old = String(valueRef.current ?? '').replace(/\s+$/, '');
      next = old ? `${old} ${said}` : said;
    } else {
      next = said;
    }
    if (!multiline) setUndo({ value: valueRef.current ?? '' });
    onValue?.(next);
    announce(t('assist.written'));
    sayAnswer(multiline ? said : next);
  };

  const voice = useVoiceTyping({
    speechLang,
    onText: onSpoken,
    onError: (problem) => explain(problem.key, { language: t(`voice.speechLanguages.${problem.params?.speechLang ?? speechLang}`) }),
  });

  // Auto-read (off by default): the field's help is spoken when the box gets focus, but not before
  // the first touch of the page, not while a microphone is on, and typing stops it at once.
  const onFocusRef = useRef(null);
  useEffect(() => {
    onFocusRef.current = () => {
      if (!hasInteracted() || getAudioState().listeningId) return;
      setBubble(true);
      setMessage(null);
      speakKey(textKey);
    };
  });
  useEffect(() => {
    const el = settings.autoRead && controlId ? document.getElementById(controlId) : null;
    if (!el) return undefined;
    const onFocus = () => onFocusRef.current?.();
    const onInput = () => { if (getAudioState().playingId === helpId) stopSound(); };
    el.addEventListener('focus', onFocus);
    el.addEventListener('input', onInput);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('input', onInput);
    };
  }, [settings.autoRead, controlId, helpId]);

  if (!settings.showButtons) return null;

  const playing = playingId === helpId;
  const answering = playingId === answerId;
  const hasValue = String(value ?? '').trim() !== '';

  const onListen = () => {
    if (playing) {
      stopSound();
      announce(t('assist.stopped'));
      return;
    }
    setBubble(true);
    setMessage(null);
    announce(t('assist.playing'));
    speakKey(textKey);
  };

  const listen = () => {
    setMessage(null);
    announce(t('assist.listening'));
    voice.start();
  };

  const onSpeak = () => {
    if (voice.listening) {
      voice.stop();
      stopMic();
      announce(t('assist.stopped'));
      return;
    }
    if (!voice.supported) return explain('assist.noMic');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return explain('assist.offlineMic');
    if (!settings.noticeAccepted) return setNoticeOpen(true);
    return listen();
  };

  const closeBubble = () => {
    stopSound();
    setBubble(false);
    setMessage(null);
    setNoVoiceFor(null);
  };

  return (
    <div className={styles.assist} data-assist={helpKey} data-assist-for={controlId}>
      <div className={styles.row}>
        <button type="button" className={styles.button} aria-pressed={playing} data-state={playing ? 'playing' : undefined} onClick={onListen}>
          <Volume2 size={20} strokeWidth={1.75} aria-hidden="true" />
          <span>{t('assist.listen')}</span>
          {fieldName && <span className="visually-hidden">: {fieldName}</span>}
          {playing && <span className={styles.bars} aria-hidden="true"><i /><i /><i /></span>}
        </button>
        {mode && (
          <button type="button" className={styles.button} aria-pressed={voice.listening} data-state={voice.listening ? 'listening' : undefined} onClick={onSpeak}>
            <Mic size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>{t('assist.speak')}</span>
            {fieldName && <span className="visually-hidden">: {fieldName}</span>}
          </button>
        )}
        {undo && (
          <button type="button" className={[styles.button, styles.quiet].join(' ')} onClick={() => { onValue?.(undo.value); setUndo(null); announce(t('assist.undone')); }}>
            <Undo2 size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>{t('assist.undo')}</span>
          </button>
        )}
      </div>
      {bubble && (
        <div className={styles.bubble} role="group" aria-label={t('assist.bubbleLabel', { field: fieldName || t('assist.thisField') })}>
          {Icon && <span className={styles.bubbleIcon} aria-hidden="true"><Icon size={26} strokeWidth={1.75} /></span>}
          <div className={styles.bubbleBody}>
            <p className={styles.bubbleText} dir="auto">{message ? t(message.key, message.params) : t(textKey)}</p>
            {noVoiceFor === 'help' && <p className={styles.note}>{t('assist.noVoice')}</p>}
            {noVoiceFor === 'answer' && <p className={styles.note}>{t('assist.noVoiceAnswer')}</p>}
            <div className={styles.bubbleActions}>
              <button type="button" className={styles.small} onClick={() => (message ? speakKey(message.key, message.params) : speakKey(textKey))}>
                <RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" />
                {t('assist.again')}
              </button>
              {canReadBack && hasValue && (
                <button type="button" className={styles.small} aria-pressed={answering} onClick={() => (answering ? stopSound() : sayAnswer(value))}>
                  <Volume2 size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t('assist.hearAnswer')}
                </button>
              )}
            </div>
          </div>
          <button type="button" className={styles.close} aria-label={t('assist.closeHelp')} onClick={closeBubble}>
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      )}
      {mode && noticeOpen && (
        <VoiceNoticeDialog
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
          onAccept={() => {
            setSettings({ noticeAccepted: true });
            setNoticeOpen(false);
            listen();
          }}
        />
      )}
    </div>
  );
}

// Re-renders only when its own field changes (the value setter from useValueSetter is stable).
export default memo(FieldAssist);

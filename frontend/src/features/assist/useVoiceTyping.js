// Voice typing with the browser's built-in speech feature (Web Speech API; Batch 3, shared since
// Batch 5). Optional: text stays the main input. Our code calls no speech service and holds no key;
// the browser decides where the audio goes (in Chrome and Edge: the browser maker's online service).
// - Only offered where SpeechRecognition (or the webkit version) exists.
// - Speech language follows the website language: Urdu -> ur-PK; English and Roman Urdu -> en-US
//   (Roman Urdu is recognised best through English). See i18n/languages.js.
// - Every error code of the API gets its own message (voice.errors.<code>), instead of one
//   generic "did not work". Pressing Stop ends with "aborted": that is not shown as an error.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { micEnded, micStarted } from './audio';

export const SPEECH_ERROR_CODES = ['not-allowed', 'service-not-allowed', 'network', 'language-not-supported', 'no-speech', 'audio-capture', 'aborted'];

export function getRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// The dictionary key for an error code from SpeechRecognition's "error" event.
export const voiceErrorKey = (code) => (SPEECH_ERROR_CODES.includes(code) ? `voice.errors.${code}` : 'voice.errors.other');

export function useVoiceTyping({ speechLang, onText, onError }) {
  const Recognition = getRecognition();
  const id = `mic${useId()}`; // only one microphone or sound in the whole app (features/assist/audio.js)
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null); // { key, params } or null
  const recognitionRef = useRef(null);
  const stoppedByUser = useRef(false);
  const onTextRef = useRef(onText);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTextRef.current = onText;
    onErrorRef.current = onError;
  });

  // Leaving the page stops the microphone.
  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  const stop = useCallback(() => {
    stoppedByUser.current = true;
    recognitionRef.current?.stop?.();
  }, []);

  const start = useCallback(() => {
    if (!Recognition) return;
    setError(null);
    stoppedByUser.current = false;
    let recognition;
    try {
      recognition = new Recognition();
    } catch {
      setError({ key: 'voice.errors.other' });
      return;
    }
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const said = Array.from(event.results).map((r) => r[0].transcript).join(' ').trim();
      if (said) onTextRef.current(said);
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted' && stoppedByUser.current) return; // the user pressed Stop
      const problem = { key: voiceErrorKey(event.error), params: { speechLang } };
      setError(problem);
      onErrorRef.current?.(problem);
    };
    recognition.onend = () => {
      setListening(false);
      micEnded(id);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      micStarted(id, () => {
        stoppedByUser.current = true;
        recognition.abort?.();
        setListening(false);
      });
    } catch {
      // start() throws if the browser is already listening or blocks it
      setListening(false);
      setError({ key: 'voice.errors.other' });
    }
  }, [Recognition, speechLang, id]);

  return { supported: Boolean(Recognition), listening, error, start, stop, clearError: () => setError(null) };
}

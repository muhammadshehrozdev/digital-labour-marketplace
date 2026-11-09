// Voice typing with the browser's Web Speech API (Batch 3 fix). Optional: text stays the main input.
// - Only offered where SpeechRecognition (or the webkit version) exists.
// - Speech language follows the website language: Urdu -> ur-PK; English and Roman Urdu -> en-US
//   (Roman Urdu is recognised best through English). See i18n/languages.js.
// - Every error code of the API gets its own message (voice.errors.<code>), instead of one
//   generic "did not work". Pressing Stop ends with "aborted": that is not shown as an error.
import { useCallback, useEffect, useRef, useState } from 'react';

export const SPEECH_ERROR_CODES = ['not-allowed', 'service-not-allowed', 'network', 'language-not-supported', 'no-speech', 'audio-capture', 'aborted'];

export function getRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// The dictionary key for an error code from SpeechRecognition's "error" event.
export const voiceErrorKey = (code) => (SPEECH_ERROR_CODES.includes(code) ? `voice.errors.${code}` : 'voice.errors.other');

export function useVoiceTyping({ speechLang, onText }) {
  const Recognition = getRecognition();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null); // { key, params } or null
  const recognitionRef = useRef(null);
  const stoppedByUser = useRef(false);
  const onTextRef = useRef(onText);
  useEffect(() => {
    onTextRef.current = onText;
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
      setError({ key: voiceErrorKey(event.error), params: { speechLang } });
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if the browser is already listening or blocks it
      setListening(false);
      setError({ key: 'voice.errors.other' });
    }
  }, [Recognition, speechLang]);

  return { supported: Boolean(Recognition), listening, error, start, stop, clearError: () => setError(null) };
}

// Fake browser speech features for the Batch 5 tests (jsdom has none of them):
//   speechSynthesis + SpeechSynthesisUtterance (voices can arrive late, like in Chrome),
//   SpeechRecognition (results and errors on demand), and Audio (a recorded clip plays or fails).
// Nothing here makes a sound or opens a microphone.
import { act } from '@testing-library/react';

export class FakeUtterance {
  constructor(text) { this.text = text; }
}

export function makeSynth(voices = []) {
  const synth = {
    voices,
    spoken: [],
    cancelled: 0,
    listeners: {},
    getVoices() { return this.voices; },
    addEventListener(type, fn) { (this.listeners[type] ??= new Set()).add(fn); },
    removeEventListener(type, fn) { this.listeners[type]?.delete(fn); },
    speak(utterance) { this.spoken.push(utterance); },
    cancel() { this.cancelled += 1; },
    // voices arrive late
    setVoices(list) { this.voices = list; this.listeners.voiceschanged?.forEach((fn) => fn()); },
    // the last utterance ends
    finish() { const u = this.spoken[this.spoken.length - 1]; u?.onend?.(); },
    get last() { return this.spoken[this.spoken.length - 1]; },
  };
  return synth;
}

export const VOICES = {
  ur: { name: 'Urdu (Pakistan)', lang: 'ur-PK' },
  en: { name: 'English (US)', lang: 'en-US' },
};

export let recognitions = [];
export class FakeRecognition {
  constructor() { this.started = false; recognitions.push(this); }
  start() { this.started = true; }
  stop() { this.stopped = true; this.onerror?.({ error: 'aborted' }); this.onend?.(); }
  abort() { this.aborted = true; this.onend?.(); }
  // the browser heard something
  say(text) { act(() => { this.onresult?.({ results: [[{ transcript: text }]] }); this.onend?.(); }); }
  fail(code) { act(() => { this.onerror?.({ error: code }); this.onend?.(); }); }
}
export const lastRecognition = () => recognitions[recognitions.length - 1];

export let audios = [];
export function makeAudio({ fails = false } = {}) {
  return class FakeAudio {
    constructor(src) { this.src = src; this.paused = true; audios.push(this); }
    play() { if (fails) return Promise.reject(new Error('NotAllowedError')); this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  };
}

// install({ voices, recognition, audio }) puts the fakes on window; uninstall() removes them.
export function installSpeech({ voices = [], recognition = true, audio = 'ok' } = {}) {
  recognitions = [];
  audios = [];
  const synth = makeSynth(voices);
  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = FakeUtterance;
  if (recognition) window.webkitSpeechRecognition = FakeRecognition;
  if (audio) window.Audio = makeAudio({ fails: audio === 'fail' });
  return synth;
}

const ORIGINAL_AUDIO = typeof window !== 'undefined' ? window.Audio : undefined;
export function uninstallSpeech() {
  delete window.speechSynthesis;
  delete window.SpeechSynthesisUtterance;
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
  window.Audio = ORIGINAL_AUDIO;
}

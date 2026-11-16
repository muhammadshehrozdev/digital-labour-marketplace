// Audio help for the whole website (Batch 5, D-034). One sound OR one microphone at a time:
// starting one stops the other. Sources, in this order:
//   1. a clip the team recorded (public/audio/help/<ur|en>/<key-with-dashes>.<ext>, listed in
//      clipManifest.json): most reliable, works offline;
//   2. the browser's own speech synthesis, if the device has a voice for the language;
//   3. nothing: the caller shows the help on screen and says there is no voice (the bubble opens
//      with every sound anyway).
// Nothing here talks to a server of ours or to any outside service.
import manifest from './clipManifest.json';
import { pickVoice } from './voices.js';

export const SPEECH_RATE = 0.9;

// '/audio/help/ur/help-field-register-name.webm' or null when the team has not recorded it.
export function clipUrl(lang, key, clips = manifest) {
  const base = String(key).replace(/\./g, '-');
  const file = (clips[lang] ?? []).find((f) => f.replace(/\.[^.]+$/, '') === base);
  return file ? `/audio/help/${lang}/${file}` : null;
}

// ---- state shared with the buttons (useSyncExternalStore in useAudioState) ----
let state = { playingId: null, listeningId: null };
const listeners = new Set();
const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};
export const getAudioState = () => state;
export function subscribeAudio(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let stopSoundNow = null;
let stopMicNow = null;

export function stopSound() {
  const stop = stopSoundNow;
  stopSoundNow = null;
  stop?.();
  if (state.playingId) setState({ playingId: null });
}

export function stopMic() {
  const stop = stopMicNow;
  stopMicNow = null;
  stop?.();
  if (state.listeningId) setState({ listeningId: null });
}

export function stopAll() {
  stopSound();
  stopMic();
}

// The voice typing hook reports its microphone here, so a sound and a microphone never overlap.
export function micStarted(id, stop) {
  stopSound();
  if (state.listeningId && state.listeningId !== id) stopMic();
  stopMicNow = stop;
  setState({ listeningId: id });
}
export function micEnded(id) {
  if (state.listeningId !== id) return;
  stopMicNow = null;
  setState({ listeningId: null });
}

// ---- voices (they load late in Chrome: wait for "voiceschanged", but never forever) ----
export function getSynth() {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
}

export function loadVoices(timeoutMs = 1500) {
  const synth = getSynth();
  if (!synth) return Promise.resolve([]);
  const now = synth.getVoices?.() ?? [];
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener?.('voiceschanged', done);
      clearTimeout(timer);
      resolve(synth.getVoices?.() ?? []);
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener?.('voiceschanged', done);
  });
}

export async function hasVoiceFor(lang) {
  return Boolean(pickVoice(await loadVoices(), lang));
}

function playClip(id, url) {
  return new Promise((resolve) => {
    let audio;
    try {
      audio = new window.Audio(url);
    } catch {
      resolve(false);
      return;
    }
    const finish = () => {
      if (state.playingId === id) {
        stopSoundNow = null;
        setState({ playingId: null });
      }
    };
    audio.onended = finish;
    audio.onerror = () => { finish(); resolve(false); };
    stopSoundNow = () => audio.pause();
    setState({ playingId: id });
    Promise.resolve(audio.play())
      .then(() => resolve(true))
      .catch(() => { finish(); resolve(false); });
  });
}

function playClips(id, urls) {
  // a list of clips one after another (digits read back one by one)
  let index = 0;
  let stopped = false;
  let audio = null;
  const finish = () => {
    if (state.playingId === id) {
      stopSoundNow = null;
      setState({ playingId: null });
    }
  };
  const next = () => {
    if (stopped || index >= urls.length) { finish(); return; }
    audio = new window.Audio(urls[index]);
    index += 1;
    audio.onended = next;
    audio.onerror = finish;
    Promise.resolve(audio.play()).catch(finish);
  };
  stopSoundNow = () => { stopped = true; audio?.pause(); };
  setState({ playingId: id });
  next();
  return true;
}

async function speakWithVoice(id, text, lang) {
  const synth = getSynth();
  if (!synth || !text) return false;
  const voice = pickVoice(await loadVoices(), lang);
  if (!voice) return false;
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = SPEECH_RATE;
  const finish = () => {
    if (state.playingId === id) {
      stopSoundNow = null;
      setState({ playingId: null });
    }
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  synth.cancel();
  stopSoundNow = () => synth.cancel();
  setState({ playingId: id });
  synth.speak(utterance);
  return true;
}

// Plays help. Returns 'clip', 'voice' or 'none' (then the caller shows "no voice on this device").
//   id: who plays (the button shows "playing"); clip: a URL or null; text + lang: for the voice.
export async function play({ id, clip = null, clips = null, text = '', lang = 'en' }) {
  stopAll();
  if (clips?.length) return playClips(id, clips) ? 'clip' : 'none';
  if (clip && (await playClip(id, clip))) return 'clip';
  if (await speakWithVoice(id, text, lang)) return 'voice';
  return 'none';
}

// Texts and limits used by the skills editor.
export const MAX_TEXT = 2000;
export const VOICE_NOTICE =
  "Voice typing uses your browser's speech service, which may send your audio to an online service. Use the text box if you prefer.";

// Three examples the worker can tap to see how to write (one per script). Example text only.
export const EXAMPLES = [
  { id: 'ur', label: 'اردو مثال', lang: 'ur', text: 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔' },
  { id: 'roman', label: 'Roman Urdu example', lang: 'ur-Latn', text: 'Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon.' },
  { id: 'en', label: 'English example', lang: 'en', text: 'I am a painter with 6 years of experience in emulsion, putty and texture work.' },
];

export const NO_MATCH_TEXT = {
  no_trade_words: 'We did not find any trade words. Try naming your work, for example "wiring", "plumbing" or "safai". You can also add skills from the list below.',
  negative_phrase: 'It sounds like you are new to this work. That is fine: you can add skills from the list below when you are ready.',
  empty: 'Please write a few words about your work first.',
};

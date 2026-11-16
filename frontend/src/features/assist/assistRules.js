// Where voice typing and reading an answer aloud are NOT allowed (Batch 5, D-035). Checked inside
// FieldAssist itself, so no page can switch them on by mistake:
//   password: a secret must never be said aloud, and the audio goes to the browser's speech service;
//   CNIC: an identity number must not be sent to a speech service;
//   email: dictating an address is unreliable (the help tells the person to type it, or ask someone).
export const NO_VOICE_INPUT_TYPES = Object.freeze(['email', 'password']);
export const NO_VOICE_MASKS = Object.freeze(['cnic']);

export const isPrivateField = ({ inputType, mask, secret }) =>
  Boolean(secret) || NO_VOICE_INPUT_TYPES.includes(inputType) || NO_VOICE_MASKS.includes(mask);

// 'text' | 'digits' | 'number' when the 🎤 button may be shown, otherwise null.
export function speakModeFor({ speak, inputType, mask, secret }) {
  if (!speak || isPrivateField({ inputType, mask, secret })) return null;
  return ['text', 'digits', 'number'].includes(speak) ? speak : null;
}

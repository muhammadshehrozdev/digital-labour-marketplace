// Same rules as the server (backend/validators/common.js, decision D-005).
// Returns null, or an error { key, params } to translate where it is shown.
export const PASSWORD_MIN_CHARS = 15;
export const PASSWORD_MAX_BYTES = 72;
export function passwordProblem(password) {
  if ([...password].length < PASSWORD_MIN_CHARS) return { key: 'validation.passwordShort', params: { min: PASSWORD_MIN_CHARS } };
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return { key: 'validation.passwordLong' };
  if (!password.trim()) return { key: 'validation.passwordSpaces' };
  return null;
}

// Same rules as the server (backend/validators/common.js, decision D-005).
export const PASSWORD_MIN_CHARS = 15;
export const PASSWORD_MAX_BYTES = 72;
export function passwordProblem(password) {
  if ([...password].length < PASSWORD_MIN_CHARS) return `Password must be at least ${PASSWORD_MIN_CHARS} characters.`;
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return 'Password is too long (max 72 bytes; an Urdu letter counts as 2).';
  if (!password.trim()) return 'Password cannot be only spaces.';
  return '';
}

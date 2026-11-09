// Avatar background/text pairs (all checked for AA contrast in styles/contrast.test.js).
export const AVATAR_COLORS = [
  { bg: '#D2EDE4', fg: '#0A4437' }, // green-100 / green-800
  { bg: '#FDF0D5', fg: '#1A1815' }, // saffron-100 / stone-900
  { bg: '#EAF1FD', fg: '#1D5FD1' }, // info-50 / info-700
  { bg: '#EFEDEA', fg: '#3D3934' }, // stone-100 / stone-700
  { bg: '#EAF6EE', fg: '#15803D' }, // success-50 / success-700
  { bg: '#FDECEA', fg: '#B42318' }, // danger-50 / danger-700
];

// Same name -> same colour, every time.
export function avatarColor(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = [...parts[0]][0] ?? '';
  const last = parts.length > 1 ? [...parts[parts.length - 1]][0] ?? '' : '';
  return (first + last).toUpperCase();
}

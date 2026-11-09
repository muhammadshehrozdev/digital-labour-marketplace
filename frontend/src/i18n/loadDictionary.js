// English is bundled with the app (it is also the fallback for any missing text).
// Urdu and Roman Urdu are separate files, fetched the first time they are chosen.
import en from './dictionaries/en';

const cache = { en };
const loaders = {
  ur: () => import('./dictionaries/ur'),
  'ur-Latn': () => import('./dictionaries/ur-Latn'),
};

export const englishDictionary = en;
export const cachedDictionary = (code) => cache[code] ?? null;

export async function loadDictionary(code) {
  if (cache[code]) return cache[code];
  const mod = await loaders[code]();
  cache[code] = mod.default;
  return cache[code];
}

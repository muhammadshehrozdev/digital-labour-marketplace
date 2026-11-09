// Pure translation helpers (no React), unit tested in src/test/i18n.test.js.
// Dictionaries are nested objects: t('auth.login.title') reads dict.auth.login.title.
// A value can be:
//   - a string with {name} placeholders: 'Welcome, {name}'
//   - a plural object { one, other } (optionally zero): chosen with Intl.PluralRules and {count}
import { intlLocale } from './languages';

const PLURAL_KEYS = ['zero', 'one', 'two', 'few', 'many', 'other'];

export const isPluralObject = (value) =>
  Boolean(value) && typeof value === 'object' && 'other' in value && Object.keys(value).every((k) => PLURAL_KEYS.includes(k));

export function lookup(dict, key) {
  let node = dict;
  for (const part of String(key).split('.')) {
    if (node === null || typeof node !== 'object' || !(part in node)) return undefined;
    node = node[part];
  }
  return node;
}

// Numbers in placeholders keep Western digits; other values are inserted as text.
export function interpolate(text, params = {}, lang = 'en') {
  return text.replace(/\{(\w+)\}/g, (all, name) => {
    const value = params[name];
    if (value === undefined || value === null) return all;
    if (typeof value === 'number') return new Intl.NumberFormat(intlLocale(lang)).format(value);
    return String(value);
  });
}

export function pluralForm(value, count, lang) {
  if (count === 0 && value.zero) return value.zero;
  const rule = new Intl.PluralRules(lang === 'ur-Latn' ? 'en' : lang).select(Number(count) || 0);
  return value[rule] ?? value.other;
}

// t(key, params): the text in `dict`, falling back to English, then to the key itself
// (a visible key is easy to spot and the parity test fails long before users see it).
export function createTranslator(lang, dict, fallback) {
  return function t(key, params) {
    let value = lookup(dict, key);
    if (value === undefined && fallback) value = lookup(fallback, key);
    if (value === undefined) return key;
    if (isPluralObject(value)) value = pluralForm(value, params?.count, lang);
    if (typeof value !== 'string') return key;
    return interpolate(value, params, lang);
  };
}

// Every leaf key of a dictionary ("a.b.c"), plural objects count as one leaf.
export function flattenKeys(dict, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !isPluralObject(v)) keys.push(...flattenKeys(v, path));
    else keys.push(path);
  }
  return keys;
}

// An error worth showing: a dictionary key (client checks), { key, params },
// or a server descriptor { code, params, message } (see utils/apiErrors.js).
// Server codes live under errors.<CODE>; {field} is replaced by the translated field name.
export function translateError(t, error) {
  if (!error) return '';
  if (typeof error === 'string') return t(error);
  if (error.key) return t(error.key, error.params);
  if (error.code) {
    const key = `errors.${error.code}`;
    const params = { ...(error.params ?? {}) };
    if (params.fieldKey) {
      const label = t(`fields.${params.fieldKey}`);
      params.field = label === `fields.${params.fieldKey}` ? params.field : label;
    }
    if (error.code === 'TRANSITION_INVALID') {
      params.verb = t(`admin.evidence.verbs.${params.action}`);
      params.state = t(`status.evidence.${params.status}`);
    }
    const text = t(key, params);
    if (text !== key) return text;
    return error.message || t('errors.generic');
  }
  if (typeof error.message === 'string' && error.message) return error.message;
  return t('errors.generic');
}

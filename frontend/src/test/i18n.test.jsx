// Batch 3, Part 3: three languages. Dictionary parity, server error codes, digits, scripts,
// the translate helpers, and the language chooser / switcher behaviour.
import { describe, test, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import en from '../i18n/dictionaries/en';
import ur from '../i18n/dictionaries/ur';
import urLatn from '../i18n/dictionaries/ur-Latn';
import { createTranslator, flattenKeys, interpolate, isPluralObject, lookup, translateError } from '../i18n/translate';
import { LANGUAGES } from '../i18n/languages';
import { ERRORS, ERROR_CODES } from '../../../backend/errors/catalog.js';
import { mockApi, me } from './mockApi';
import { renderAt, pathname } from './renderApp';

const DICTS = { en, ur, 'ur-Latn': urLatn };
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const leaves = (dict) => flattenKeys(dict).map((key) => [key, lookup(dict, key)]);
const texts = (value) => (isPluralObject(value) ? Object.values(value) : [value]);

describe('dictionaries (no missing or extra keys)', () => {
  const english = flattenKeys(en).sort();
  test.each(['ur', 'ur-Latn'])('%s has exactly the keys of en.js', (lang) => {
    const keys = flattenKeys(DICTS[lang]).sort();
    expect(keys.filter((k) => !english.includes(k)), 'extra keys').toEqual([]);
    expect(english.filter((k) => !keys.includes(k)), 'missing keys').toEqual([]);
  });

  test.each(['en', 'ur', 'ur-Latn'])('%s: every text is a non-empty string, plurals have "one" and "other"', (lang) => {
    for (const [key, value] of leaves(DICTS[lang])) {
      if (isPluralObject(value)) {
        expect(Object.keys(value), key).toEqual(expect.arrayContaining(['one', 'other']));
      }
      for (const text of texts(value)) {
        expect(typeof text, key).toBe('string');
        expect(text.trim().length, key).toBeGreaterThan(0);
      }
    }
  });

  test.each(['ur', 'ur-Latn'])('%s keeps the same {placeholders} as English (nothing lost in translation)', (lang) => {
    const problems = [];
    for (const [key, value] of leaves(en)) {
      const want = [...new Set(placeholders(texts(value).join(' ')))].join();
      const got = [...new Set(placeholders(texts(lookup(DICTS[lang], key)).join(' ')))].join();
      if (want !== got) problems.push(`${key}: {${want}} vs {${got}}`);
    }
    expect(problems).toEqual([]);
  });

  test('Urdu texts are written in Urdu script; Roman Urdu texts in Latin letters', () => {
    const arabic = /[؀-ۿ]/;
    const urduWithoutScript = leaves(ur).filter(([key, v]) => {
      const t = texts(v).join(' ');
      // Codes, symbols, numbers and brand words may stay Latin.
      return /[a-z]{4,}/i.test(t) && !arabic.test(t) && !['common.rupees', 'ui.progress', 'common.empty', 'admin.audit.columns.seq', 'common.listSeparator'].includes(key);
    });
    expect(urduWithoutScript.map(([k]) => k)).toEqual([]);
    // Roman Urdu: no Urdu script, except the button that shows the Urdu example in Urdu.
    const romanWithScript = leaves(urLatn).filter(([key, v]) => arabic.test(texts(v).join(' ')) && key !== 'skills.examples.ur');
    expect(romanWithScript.map(([k]) => k)).toEqual([]);
  });
});

describe('server error codes (backend/errors/catalog.js)', () => {
  test.each(['en', 'ur', 'ur-Latn'])('every code has a text in %s', (lang) => {
    const missing = ERROR_CODES.filter((code) => typeof DICTS[lang].errors[code] !== 'string');
    expect(missing).toEqual([]);
  });

  test('the English texts are the same as the server catalog', () => {
    const different = ERROR_CODES.filter((code) => en.errors[code] !== ERRORS[code]);
    expect(different).toEqual([]);
  });

  test('no dictionary has error codes the server does not know', () => {
    for (const dict of Object.values(DICTS)) {
      const unknown = Object.keys(dict.errors).filter((k) => /^[A-Z_]+$/.test(k) && !ERROR_CODES.includes(k));
      expect(unknown).toEqual([]);
    }
  });
});

describe('translate helpers', () => {
  const tUr = createTranslator('ur', ur, en);
  const tEn = createTranslator('en', en, en);

  test('lookup, placeholders and fallback to English, then to the key', () => {
    expect(tEn('dashboard.welcome', { name: 'Rashid' })).toBe('Welcome, Rashid');
    expect(tUr('dashboard.welcome', { name: 'Rashid' })).toBe('خوش آمدید، Rashid');
    expect(createTranslator('ur', {}, en)('common.save')).toBe('Save'); // missing in ur -> English
    expect(tEn('no.such.key')).toBe('no.such.key');
  });

  test('plurals use Intl.PluralRules', () => {
    expect(tEn('find.found', { count: 1 })).toBe('1 worker found');
    expect(tEn('find.found', { count: 3 })).toBe('3 workers found');
    expect(tUr('find.found', { count: 1 })).toBe('1 کاریگر ملا');
    expect(tUr('find.found', { count: 7 })).toBe('7 کاریگر ملے');
  });

  test('numbers keep Western digits (0-9) in Urdu', () => {
    expect(interpolate('{n}', { n: 12500 }, 'ur')).toBe('12,500');
    expect(tUr('ui.pagination.status', { page: 2, pages: 5 })).toBe('صفحہ 2 از 5');
    expect(tUr('ui.pagination.status', { page: 2, pages: 5 })).not.toMatch(/[۰-۹٠-٩]/);
  });

  test('server errors: code + translated field name; unknown code -> server message; no answer -> network text', () => {
    const descriptor = { code: 'TEXT_TOO_LONG', params: { field: 'Bio', fieldKey: 'bio', max: 500 }, message: 'bio: Bio must be at most 500 characters' };
    expect(translateError(tEn, descriptor)).toBe('Bio must be at most 500 characters');
    expect(translateError(tUr, descriptor)).toBe('تعارف زیادہ سے زیادہ 500 حروف کا ہو سکتا ہے');
    expect(translateError(tEn, { code: 'SOMETHING_NEW', message: 'Server text' })).toBe('Server text');
    expect(translateError(tUr, { key: 'errors.network' })).toBe(ur.errors.network);
    expect(translateError(tEn, 'validation.phone')).toBe(en.validation.phone);
  });

  test('TRANSITION_INVALID gets the action and status words in the chosen language', () => {
    const descriptor = { code: 'TRANSITION_INVALID', params: { action: 'approve', status: 'approved', verb: 'approve', state: 'approved' } };
    expect(translateError(tEn, descriptor)).toBe('You cannot approve an item that is Approved.');
    expect(translateError(tUr, descriptor)).toBe('جو چیز منظور ہو، اسے منظور نہیں کر سکتے۔');
  });
});

describe('language chooser and switcher', () => {
  test('first visit: the chooser shows three cards, each in its own language and direction', async () => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/', { language: null });
    // the cards' names start with the language; each card also has its own Listen button (Batch 5)
    const cards = await screen.findAllByRole('button', { name: /^(English|اردو|Roman Urdu)/ });
    expect(cards).toHaveLength(3);
    const urdu = cards.find((c) => c.getAttribute('lang') === 'ur');
    expect(urdu).toHaveAttribute('dir', 'rtl');
    expect(within(urdu).getByText(LANGUAGES[1].preview)).toBeInTheDocument();
    // design v3: five trade drawings, decorative only (no words to translate, hidden from screen readers)
    const trades = screen.getByTestId('chooser-trades');
    expect(trades).toHaveAttribute('aria-hidden', 'true');
    expect(trades.querySelectorAll('svg[data-art]')).toHaveLength(5);
  });

  test('choosing Urdu shows the site in Urdu, right to left, and remembers the choice', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/login', { language: null });
    await user.click(await screen.findByRole('button', { name: /اردو میں جاری رکھیں/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'لاگ ان' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'ur');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(window.localStorage.getItem('dlm.language')).toBe('ur');
    expect(pathname()).toBe('/login');
  });

  test('switching language keeps what was typed in a form (no reload)', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/login');
    await user.type(await screen.findByLabelText(/^Email/), 'ali@example.com');
    await user.click(screen.getAllByRole('button', { name: /Change language/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Roman Urdu' }));
    expect(await screen.findByRole('button', { name: 'Log in karein' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'ur-Latn');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText(/^Email/)).toHaveValue('ali@example.com');
  });

  test('a logged-in user: the choice is saved on the server (PATCH /users/me/preferences)', async () => {
    const user = userEvent.setup();
    const calls = mockApi({ 'GET /auth/me': me('customer', { preferredLanguage: 'en' }), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/find');
    await screen.findByRole('heading', { name: 'Find workers' });
    await user.click(screen.getAllByRole('button', { name: /Change language/ })[0]);
    await user.click(screen.getByRole('button', { name: 'اردو' }));
    await screen.findByRole('heading', { name: 'کاریگر تلاش کریں' });
    await waitFor(() => expect(calls.some((c) => c.key === 'PATCH /users/me/preferences' && c.body.preferredLanguage === 'ur')).toBe(true));
  });

  test('a logged-in user with a saved language gets it on a new device, without the chooser', async () => {
    mockApi({ 'GET /auth/me': me('customer', { preferredLanguage: 'ur-Latn' }), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/find', { language: null });
    expect(await screen.findByRole('heading', { name: 'Karigar dhoondein' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Continue in English/ })).not.toBeInTheDocument();
  });

  test('the browser tab title follows the language', async () => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/login', { language: 'ur-Latn' });
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    await waitFor(() => expect(document.title).toBe('Log in · Digital Labour Marketplace'));
  });
});

describe('language and login (D-019: the latest choice wins)', () => {
  test('choosing Urdu on the chooser, then logging in with an account saved as English: Urdu stays and is saved', async () => {
    const user = userEvent.setup();
    const calls = mockApi({
      'GET /auth/me': { status: 401, data: {} },
      'POST /auth/login': me('customer', { preferredLanguage: 'en' }),
      'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } },
    });
    renderAt('/login', { language: null });
    await user.click(await screen.findByRole('button', { name: /اردو میں جاری رکھیں/ }));
    await user.type(await screen.findByLabelText(/^ای میل/), 'customer@example.com');
    await user.type(screen.getByLabelText(/^پاس ورڈ/, { selector: 'input' }), 'some long pass phrase');
    await user.click(screen.getByRole('button', { name: 'لاگ ان کریں' }));
    expect(await screen.findByRole('heading', { name: 'کاریگر تلاش کریں' })).toBeInTheDocument();
    await waitFor(() => expect(calls.some((c) => c.key === 'PATCH /users/me/preferences' && c.body.preferredLanguage === 'ur')).toBe(true));
  });

  test('a language remembered from an earlier visit gives way to the language saved on the account', async () => {
    window.localStorage.setItem('dlm.language', 'ur');
    const calls = mockApi({ 'GET /auth/me': me('customer', { preferredLanguage: 'ur-Latn' }), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/find', { language: null });
    expect(await screen.findByRole('heading', { name: 'Karigar dhoondein' })).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'PATCH /users/me/preferences')).toBe(false);
  });
});
